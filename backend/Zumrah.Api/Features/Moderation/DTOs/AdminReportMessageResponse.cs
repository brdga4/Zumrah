
namespace Zumrah.Api.Features.Moderation.DTOs;

public class AdminReportMessageResponse
{
    public Guid MessageId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}
