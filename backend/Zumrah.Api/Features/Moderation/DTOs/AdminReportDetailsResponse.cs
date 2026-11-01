
namespace Zumrah.Api.Features.Moderation.DTOs;

public class AdminReportDetailsResponse
{
    public Guid ReportId { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public AdminReportDetailMessageResponse Message { get; set; } = new();

    public AdminReportStudentResponse ReportedBy { get; set; } = new();
}
