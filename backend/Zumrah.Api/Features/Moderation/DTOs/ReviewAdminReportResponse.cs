
namespace Zumrah.Api.Features.Moderation.DTOs;

public class ReviewAdminReportResponse
{
    public Guid ReportId { get; set; }

    public string Status { get; set; } = string.Empty;

    public Guid ReviewedByAdminId { get; set; }

    public DateTime ReviewedAt { get; set; }
}
