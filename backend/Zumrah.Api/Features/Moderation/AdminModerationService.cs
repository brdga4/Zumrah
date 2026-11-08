using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Chat;
using Zumrah.Api.Features.Moderation.DTOs;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Moderation;

public class AdminModerationService
{
    private readonly ZumrahDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;

    public AdminModerationService(
        ZumrahDbContext db,
        IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
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

    public async Task<(ReviewAdminReportResponse? Response, string? Error)> ReviewReportAsync(
        Guid reportId,
        Guid adminId,
        ReportStatus newStatus,
        CancellationToken cancellationToken = default)
    {
        if (newStatus != ReportStatus.DISMISSED &&
            newStatus != ReportStatus.MESSAGE_REMOVED)
        {
            return (null, "INVALID_REPORT_STATUS");
        }

        var reviewedAt = DateTime.UtcNow;

        // Store the IDs needed for broadcasting
        Guid? removedMessageId = null;
        Guid? removedChatRoomId = null;

        await using var transaction = await _db.Database.BeginTransactionAsync(
            cancellationToken);

        var affectedRows = await _db.Database.ExecuteSqlInterpolatedAsync(
            $"""
        UPDATE report
        SET status = {newStatus.ToString()},
            reviewed_by_admin_id = {adminId.ToString("D")},
            reviewed_at = {reviewedAt}
        WHERE report_id = {reportId.ToString("D")}
          AND status = 'PENDING'
        """,
            cancellationToken);

        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);

            var reportExists = await _db.Reports
                .AsNoTracking()
                .AnyAsync(
                    report => report.ReportId == reportId,
                    cancellationToken);

            if (!reportExists)
            {
                return (null, "REPORT_NOT_FOUND");
            }

            return (null, "REPORT_ALREADY_REVIEWED");
        }

        if (newStatus == ReportStatus.MESSAGE_REMOVED)
        {
            // Find the reported message and its chat room
            var messageInfo = await _db.Reports
                .AsNoTracking()
                .Where(report => report.ReportId == reportId)
                .Select(report => new
                {
                    report.MessageId,
                    report.Message.ChatRoomId
                })
                .SingleAsync(cancellationToken);

            // Soft-delete the message in MySQL
            var deletedRows = await _db.Database.ExecuteSqlInterpolatedAsync(
                $"""
            UPDATE message
            SET is_deleted = 1,
                deleted_by_admin_id = {adminId.ToString("D")},
                deleted_at = {reviewedAt}
            WHERE message_id = (
                SELECT message_id
                FROM report
                WHERE report_id = {reportId.ToString("D")}
            )
              AND is_deleted = 0
            """,
                cancellationToken);

            // Broadcast only if the message was actually deleted
            if (deletedRows > 0)
            {
                removedMessageId = messageInfo.MessageId;
                removedChatRoomId = messageInfo.ChatRoomId;
            }
        }

        // Commit the database changes before broadcasting
        await transaction.CommitAsync(cancellationToken);

        // Notify all connected students in the affected room
        if (removedMessageId.HasValue && removedChatRoomId.HasValue)
        {
            try
            {
                await _hubContext.Clients
                    .Group(removedChatRoomId.Value.ToString("D"))
                    .SendAsync("MessageRemoved", new
                    {
                        messageId = removedMessageId.Value,
                        chatRoomId = removedChatRoomId.Value
                    });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(
                    $"SignalR broadcast failed: {ex}"
                );
            }
        }

        return (new ReviewAdminReportResponse
        {
            ReportId = reportId,
            Status = newStatus.ToString(),
            ReviewedByAdminId = adminId,
            ReviewedAt = reviewedAt
        }, null);
    }
}
