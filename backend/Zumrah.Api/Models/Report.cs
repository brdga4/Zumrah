using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Models;

public class Report
{
    public Guid ReportId { get; set; }

    public Guid MessageId { get; set; }

    public Guid StudentId { get; set; }

    public string Reason { get; set; } = string.Empty;

    public ReportStatus Status { get; set; } = ReportStatus.PENDING;


    public DateTime CreatedAt { get; set; }

    public Guid? ReviewedByAdminId { get; set; }

    public DateTime? ReviewedAt { get; set; }
}
