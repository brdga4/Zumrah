
namespace Zumrah.Api.Features.Moderation.DTOs;

public class GetAdminReportsResponse
{
    public List<AdminReportItemResponse> Reports { get; set; } = new();
}
