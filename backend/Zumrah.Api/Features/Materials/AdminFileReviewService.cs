
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


}
