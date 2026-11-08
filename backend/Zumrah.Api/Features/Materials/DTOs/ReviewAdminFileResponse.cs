
namespace Zumrah.Api.Features.Materials.DTOs;

public class ReviewAdminFileResponse
{
    public Guid FileId { get; set; }

    public string Status { get; set; } = string.Empty;

    public Guid ReviewedByAdminId { get; set; }

    public DateTime ReviewedAt { get; set; }
}
