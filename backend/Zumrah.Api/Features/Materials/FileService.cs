using Azure;
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Materials;

public class FileService
{
    private readonly ZumrahDbContext _db;
    private readonly BlobStorageService _blobStorage;

    public FileService(ZumrahDbContext db, BlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }


    public async Task<(CourseFile? File, string? Error)> UploadFileAsync(
        Guid studentId,
        Guid courseId,
        IFormFile? file,
        CancellationToken cancellationToken = default)
    {
        // Check if the course exists
        var courseExists = await _db.Courses.AnyAsync(
            c => c.CourseId == courseId,
            cancellationToken);

        if (!courseExists)
            return (null, "COURSE_NOT_FOUND");

        // Check if the student is enrolled
        var isEnrolled = await _db.Enrollments.AnyAsync(
            e => e.StudentId == studentId && e.CourseId == courseId,
            cancellationToken);

        if (!isEnrolled)
            return (null, "COURSE_ACCESS_DENIED");

        // Validate file
        if (file is null || file.Length == 0)
            return (null, "INVALID_FILE");

        const long maxFileSize = 10L * 1024 * 1024;

        if (file.Length > maxFileSize)
            return (null, "FILE_TOO_LARGE");

        var fileName = Path.GetFileName(
            file.FileName.Replace('\\', '/')).Trim();

        if (string.IsNullOrWhiteSpace(fileName) ||
            fileName.Length > 255 ||
            fileName.Any(char.IsControl))
        {
            return (null, "INVALID_FILE_NAME");
        }

        if (!string.Equals(
            Path.GetExtension(fileName),
            ".pdf",
            StringComparison.OrdinalIgnoreCase))
        {
            return (null, "INVALID_FILE_TYPE");
        }

        // Open file stream
        await using var stream = file.OpenReadStream();

        // Check PDF signature
        var header = new byte[5];

        var bytesRead = await stream.ReadAtLeastAsync(
            header,
            header.Length,
            throwOnEndOfStream: false,
            cancellationToken: cancellationToken);

        if (bytesRead != 5 ||
            header[0] != '%' ||
            header[1] != 'P' ||
            header[2] != 'D' ||
            header[3] != 'F' ||
            header[4] != '-')
        {
            return (null, "INVALID_FILE_TYPE");
        }

        stream.Position = 0;

        // Generate unique file ID and blob path
        var fileId = Guid.NewGuid();
        var blobPath = $"courses/{courseId:D}/{fileId:D}.pdf";

        // Create database entity
        var courseFile = new CourseFile
        {
            FileId = fileId,
            CourseId = courseId,
            UploadedByStudentId = studentId,
            FileName = fileName,
            BlobPath = blobPath,
            Status = FileStatus.PENDING,
            UploadedAt = DateTime.UtcNow
        };

        // Upload file to Azure
        await _blobStorage.UploadAsync(
            stream,
            blobPath,
            "application/pdf",
            cancellationToken);

        try
        {
            // Save metadata to MySQL
            _db.CourseFiles.Add(courseFile);

            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception saveException)
        {
            // Try to remove the uploaded blob if saving fails
            try
            {
                using var cleanupTimeout =
                    new CancellationTokenSource(TimeSpan.FromSeconds(15));

                await _blobStorage.DeleteAsync(blobPath, cleanupTimeout.Token);
            }
            catch (Exception cleanupException)
            {
                throw new AggregateException("Saving file metadata and cleaning up the blob both failed.", saveException, cleanupException);
            }

            throw;
        }

        return (courseFile, null);
    }


    public async Task<(Stream? Content, string? FileName, string? ContentType, string? Error)> DownloadFileAsync(
        Guid studentId,
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        // Finds the file metadata in MySQL
        var courseFile = await _db.CourseFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                f => f.FileId == fileId,
                cancellationToken);

        if (courseFile is null)
            return (null, null, null, "FILE_NOT_FOUND");

        // Students can only download approved files
        if (courseFile.Status != FileStatus.APPROVED)
            return (null, null, null, "FILE_ACCESS_DENIED");

        // Checks if the student is enrolled in the file's course
        var isEnrolled = await _db.Enrollments.AnyAsync(
            e => e.StudentId == studentId &&
                 e.CourseId == courseFile.CourseId,
            cancellationToken);

        if (!isEnrolled)
            return (null, null, null, "FILE_ACCESS_DENIED");

        // Download the file stream from Azure
        Stream content;

        try
        {
            content = await _blobStorage.DownloadAsync(
                courseFile.BlobPath,
                cancellationToken);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return (null, null, null, "FILE_NOT_FOUND");
        }

        // Return the stream and file information
        return (content, courseFile.FileName, "application/pdf", null);
    }


    public async Task<(List<CourseFile>? Files, string? Error)> GetCourseFilesAsync(
        Guid studentId,
        Guid courseId,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        // Checks if the course exists
        var courseExists = await _db.Courses.AnyAsync(
            c => c.CourseId == courseId,
            cancellationToken);

        if (!courseExists)
            return (null, "COURSE_NOT_FOUND");

        // Checks if the student is enrolled
        var isEnrolled = await _db.Enrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId, cancellationToken);

        if (!isEnrolled)
            return (null, "COURSE_ACCESS_DENIED");

        // Gets approved files belonging to the course
        var query = _db.CourseFiles
            .AsNoTracking()
            .Where(f => f.CourseId == courseId && f.Status == FileStatus.APPROVED);

        // Filter by file name if a search term was provided
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();

            query = query.Where(f => f.FileName.Contains(searchTerm));
        }

        // Sort newest files first
        var files = await query
            .OrderByDescending(f => f.UploadedAt)
            .ToListAsync(cancellationToken);

        return (files, null);
    }
}
