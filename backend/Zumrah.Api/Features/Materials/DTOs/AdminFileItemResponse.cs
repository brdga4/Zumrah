
namespace Zumrah.Api.Features.Materials.DTOs;

public class AdminFileItemResponse
{
    public Guid FileId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public AdminFileCourseResponse Course { get; set; } = new();

    public AdminFileUploaderResponse UploadedBy { get; set; } = new();

    public DateTime UploadedAt { get; set; }
}
