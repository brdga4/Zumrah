using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Chat;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Moderation;

public class ReportService
{
    private readonly ZumrahDbContext _db;
    private readonly ChatService _chatService;

    public ReportService(ZumrahDbContext db, ChatService chatService)
    {
        _db = db;
        _chatService = chatService;
    }

    public async Task<(Report? Report, string? Error)> CreateReportAsync(
        Guid studentId,
        Guid messageId,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        // Validates the report reason
        if (string.IsNullOrWhiteSpace(reason))
        {
            return (null, "INVALID_REASON");
        }

        reason = reason.Trim();

        if (reason.Length > 1000)
        {
            return (null, "REASON_TOO_LONG");
        }

        // Gets the reported message
        var message = await _db.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(
                m => m.MessageId == messageId,
                cancellationToken);

        if (message is null || message.IsDeleted)
        {
            return (null, "MESSAGE_NOT_FOUND");
        }

        // Checks whether the student can access the message's room
        var roomResult = await _chatService.GetChatRoomAsync(
            studentId,
            message.ChatRoomId,
            cancellationToken);

        if (roomResult.Error is not null)
        {
            return (null, roomResult.Error);
        }

        // Checks whether the student has already reported this message
        var alreadyReported = await _db.Reports.AnyAsync(
            r => r.StudentId == studentId &&
                 r.MessageId == messageId,
            cancellationToken);

        if (alreadyReported)
        {
            return (null, "ALREADY_REPORTED");
        }

        // Creates the report
        var report = new Report
        {
            ReportId = Guid.NewGuid(),
            MessageId = messageId,
            StudentId = studentId,
            Reason = reason,
            Status = ReportStatus.PENDING,
            CreatedAt = DateTime.UtcNow
        };

        // Saves the report to MySQL
        _db.Reports.Add(report);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Handles a duplicate report created by another request
            var duplicateExists = await _db.Reports
                .AsNoTracking()
                .AnyAsync(
                    r => r.StudentId == studentId &&
                         r.MessageId == messageId,
                    cancellationToken);

            if (duplicateExists)
            {
                return (null, "ALREADY_REPORTED");
            }

            throw;
        }

        return (report, null);
    }
}
