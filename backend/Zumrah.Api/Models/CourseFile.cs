using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Models;

public class CourseFile
{
    public Guid FileId { get; set; }

    public Guid CourseId { get; set; }

    public Course Course { get; set; } = null!;

    public Guid UploadedByStudentId { get; set; }

    public Student UploadedByStudent { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string BlobPath { get; set; } = string.Empty;

    public FileStatus Status { get; set; } = FileStatus.PENDING;

    public DateTime UploadedAt { get; set; }

    public Guid? ReviewedByAdminId { get; set; }

    public DateTime? ReviewedAt { get; set; }
}
