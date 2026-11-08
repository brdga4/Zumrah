namespace Zumrah.Api.Features.Materials.DTOs;

public class UploadCourseFileResponse
{
    public Guid FileId { get; set; }
    public Guid CourseId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}
