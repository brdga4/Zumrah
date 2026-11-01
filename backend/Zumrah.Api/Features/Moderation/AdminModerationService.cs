
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Moderation.DTOs;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Moderation;

public class AdminModerationService
{
    private readonly ZumrahDbContext _db;

    public AdminModerationService(ZumrahDbContext db)
    {
        _db = db;
    }

    public async Task<GetAdminReportsResponse> GetReportsAsync(
        ReportStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Reports.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(report => report.Status == status.Value);
        }

        var reports = await query
            .OrderByDescending(report => report.CreatedAt)
            .ThenBy(report => report.ReportId)
            .Select(report => new
            {
                report.ReportId,
                report.Reason,
                report.Status,
                report.CreatedAt,
                MessageId = report.Message.MessageId,
                MessageContent = report.Message.Content,
                MessageSentAt = report.Message.SentAt,
                StudentId = report.ReportedByStudent.StudentId,
                StudentName = report.ReportedByStudent.Name
            })
            .ToListAsync(cancellationToken);

        return new GetAdminReportsResponse
        {
            Reports = reports.Select(report => new AdminReportItemResponse
            {
                ReportId = report.ReportId,
                Reason = report.Reason,
                Status = report.Status.ToString(),
                CreatedAt = report.CreatedAt,
                Message = new AdminReportMessageResponse
                {
                    MessageId = report.MessageId,
                    Content = report.MessageContent,
                    SentAt = report.MessageSentAt
                },
                ReportedBy = new AdminReportStudentResponse
                {
                    StudentId = report.StudentId,
                    Name = report.StudentName
                }
            }).ToList()
        };
    }

    public async Task<AdminReportDetailsResponse?> GetReportByIdAsync(
        Guid reportId,
        CancellationToken cancellationToken = default)
    {
        var report = await _db.Reports
            .AsNoTracking()
            .Where(report => report.ReportId == reportId)
            .Select(report => new
            {
                report.ReportId,
                report.Reason,
                report.Status,
                report.CreatedAt,
                MessageId = report.Message.MessageId,
                MessageContent = report.Message.Content,
                MessageSentAt = report.Message.SentAt,
                SenderId = report.Message.Student.StudentId,
                SenderName = report.Message.Student.Name,
                ReportedById = report.ReportedByStudent.StudentId,
                ReportedByName = report.ReportedByStudent.Name
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (report is null)
        {
            return null;
        }

        return new AdminReportDetailsResponse
        {
            ReportId = report.ReportId,
            Reason = report.Reason,
            Status = report.Status.ToString(),
            CreatedAt = report.CreatedAt,
            Message = new AdminReportDetailMessageResponse
            {
                MessageId = report.MessageId,
                Content = report.MessageContent,
                SentAt = report.MessageSentAt,
                Sender = new AdminReportStudentResponse
                {
                    StudentId = report.SenderId,
                    Name = report.SenderName
                }
            },
            ReportedBy = new AdminReportStudentResponse
            {
                StudentId = report.ReportedById,
                Name = report.ReportedByName
            }
        };
    }

}
