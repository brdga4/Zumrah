
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Materials.DTOs;
using Zumrah.Api.Models.Enums;
using Azure;

namespace Zumrah.Api.Features.Materials;


public class AdminFileReviewService
{
    private readonly ZumrahDbContext _db;
    private readonly BlobStorageService _blobStorage;

    public AdminFileReviewService(
        ZumrahDbContext db,
        BlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }


    public async Task<GetAdminFilesResponse> GetFilesAsync(
        FileStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _db.CourseFiles.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(file => file.Status == status.Value);
        }

        var files = await query
            .OrderByDescending(file => file.UploadedAt)
            .ThenBy(file => file.FileId)
            .Select(file => new
            {
                file.FileId,
                file.FileName,
                file.Status,
                file.UploadedAt,
                file.Course.CourseId,
                file.Course.CourseCode,
                file.Course.CourseName,
                StudentId = file.UploadedByStudent.StudentId,
                StudentName = file.UploadedByStudent.Name
            })
            .ToListAsync(cancellationToken);

        return new GetAdminFilesResponse
        {
            Files = files.Select(file => new AdminFileItemResponse
            {
                FileId = file.FileId,
                FileName = file.FileName,
                Status = file.Status.ToString(),
                UploadedAt = file.UploadedAt,
                Course = new AdminFileCourseResponse
                {
                    CourseId = file.CourseId,
                    CourseCode = file.CourseCode,
                    CourseName = file.CourseName
                },
                UploadedBy = new AdminFileUploaderResponse
                {
                    StudentId = file.StudentId,
                    Name = file.StudentName
                }
            }).ToList()
        };
    }

    public async Task<AdminFileItemResponse?> GetFileByIdAsync(
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        var file = await _db.CourseFiles
            .AsNoTracking()
            .Where(file => file.FileId == fileId)
            .Select(file => new
            {
                file.FileId,
                file.FileName,
                file.Status,
                file.UploadedAt,
                file.Course.CourseId,
                file.Course.CourseCode,
                file.Course.CourseName,
                StudentId = file.UploadedByStudent.StudentId,
                StudentName = file.UploadedByStudent.Name
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (file is null)
        {
            return null;
        }

        return new AdminFileItemResponse
        {
            FileId = file.FileId,
            FileName = file.FileName,
            Status = file.Status.ToString(),
            UploadedAt = file.UploadedAt,
            Course = new AdminFileCourseResponse
            {
                CourseId = file.CourseId,
                CourseCode = file.CourseCode,
                CourseName = file.CourseName
            },
            UploadedBy = new AdminFileUploaderResponse
            {
                StudentId = file.StudentId,
                Name = file.StudentName
            }
        };
    }

    public async Task<(Stream? Content, string? FileName, string? Error)> DownloadFileAsync(
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        var file = await _db.CourseFiles
            .AsNoTracking()
            .Where(file => file.FileId == fileId)
            .Select(file => new
            {
                file.FileName,
                file.BlobPath
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (file is null)
        {
            return (null, null, "FILE_NOT_FOUND");
        }

        try
        {
            var content = await _blobStorage.DownloadAsync(
                file.BlobPath,
                cancellationToken);

            return (content, file.FileName, null);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return (null, null, "FILE_NOT_FOUND");
        }
    }


    public async Task<(ReviewAdminFileResponse? Response, string? Error)> ReviewFileAsync(
        Guid fileId,
        Guid adminId,
        FileStatus newStatus,
        CancellationToken cancellationToken = default)
    {
        if (newStatus != FileStatus.APPROVED &&
            newStatus != FileStatus.REJECTED)
        {
            return (null, "INVALID_FILE_STATUS");
        }

        var reviewedAt = DateTime.UtcNow;

        var affectedRows = await _db.Database.ExecuteSqlInterpolatedAsync(
            $"""
        UPDATE course_file
        SET status = {newStatus.ToString()},
            reviewed_by_admin_id = {adminId.ToString("D")},
            reviewed_at = {reviewedAt}
        WHERE file_id = {fileId.ToString("D")}
          AND status = 'PENDING'
        """,
            cancellationToken);

        if (affectedRows == 0)
        {
            var fileExists = await _db.CourseFiles
                .AsNoTracking()
                .AnyAsync(
                    file => file.FileId == fileId,
                    cancellationToken);

            if (!fileExists)
            {
                return (null, "FILE_NOT_FOUND");
            }

            return (null, "FILE_ALREADY_REVIEWED");
        }

        return (new ReviewAdminFileResponse
        {
            FileId = fileId,
            Status = newStatus.ToString(),
            ReviewedByAdminId = adminId,
            ReviewedAt = reviewedAt
        }, null);
    }


}
