
namespace Zumrah.Api.Features.Moderation.DTOs;

public class AdminReportStudentResponse
{
    public Guid StudentId { get; set; }

    public string Name { get; set; } = string.Empty;
}
