using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Chat;

public class ChatService
{
    private readonly ZumrahDbContext _db;

    public ChatService(ZumrahDbContext db)
    {
        _db = db;
    }

    public async Task<(ChatRoom? Room, string? Error)> GetChatRoomAsync(
        Guid studentId,
        Guid chatRoomId,
        CancellationToken cancellationToken = default)
    {
        // Gets the requested chat room
        var room = await _db.ChatRooms
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.ChatRoomId == chatRoomId,
                cancellationToken);

        if (room is null)
        {
            return (null, "CHAT_ROOM_NOT_FOUND");
        }

        if (!room.IsActive)
        {
            return (null, "CHAT_ROOM_INACTIVE");
        }

        // Checks student enrollment
        if (room.RoomType == RoomType.COURSE)
        {
            if (room.CourseId == null)
            {
                return (null, "CHAT_ROOM_NOT_FOUND");
            }

            var isEnrolled = await _db.Enrollments.AnyAsync(
                e => e.StudentId == studentId && e.CourseId == room.CourseId.Value, cancellationToken
            );

            if (!isEnrolled)
            {
                return (null, "CHAT_ACCESS_DENIED");
            }
        }
        // Checks whether the student belongs to the major
        else if (room.RoomType == RoomType.MAJOR)
        {
            if (room.MajorId == null)
            {
                return (null, "CHAT_ROOM_NOT_FOUND");
            }

            var isStudentInMajor = await _db.Students.AnyAsync(
                s => s.StudentId == studentId && s.MajorId == room.MajorId.Value, cancellationToken
            );

            if (!isStudentInMajor)
            {
                return (null, "CHAT_ACCESS_DENIED");
            }
        }
        else
        {
            return (null, "CHAT_ROOM_NOT_FOUND");
        }

        return (room, null);
    }


    public async Task<(Message? Message, string? StudentName, string? Error)> SendMessageAsync(
        Guid studentId,
        Guid chatRoomId,
        string? content,
        CancellationToken cancellationToken = default)
    {
        // Validates the message content
        if (string.IsNullOrWhiteSpace(content))
        {
            return (null, null, "INVALID_MESSAGE");
        }

        content = content.Trim();

        if (content.Length > 2000)
        {
            return (null, null, "MESSAGE_TOO_LONG");
        }

        // Gets the requested room and checks student access
        var roomResult = await GetChatRoomAsync(studentId, chatRoomId, cancellationToken);

        if (roomResult.Error is not null)
        {
            return (null, null, roomResult.Error);
        }

        // Gets the student who sent the message
        var student = await _db.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.StudentId == studentId, cancellationToken);

        if (student is null)
        {
            return (null, null, "STUDENT_NOT_FOUND");
        }


        // Creates the message
        var message = new Message
        {
            MessageId = Guid.NewGuid(),
            ChatRoomId = chatRoomId,
            StudentId = studentId,
            Content = content,
            SentAt = DateTime.UtcNow,
            IsDeleted = false
        };

        // Saves the message to MySQL
        _db.Messages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);

        return (message, student.Name, null);
    }

    public async Task<(List<Message>? Messages, Guid? NextBefore, string? Error)> GetChatMessagesAsync(
        Guid studentId,
        Guid chatRoomId,
        Guid? before = null,
        int limit = 50,
        CancellationToken cancellationToken = default)
    {
        // Validates the message limit
        if (limit < 1 || limit > 100)
        {
            return (null, null, "INVALID_LIMIT");
        }

        // Checks whether the student can access the room
        var roomResult = await GetChatRoomAsync(
            studentId, chatRoomId, cancellationToken);

        if (roomResult.Error is not null)
        {
            return (null, null, roomResult.Error);
        }

        // Gets non-deleted messages from the requested room
        var query = _db.Messages
            .AsNoTracking()
            .Where(m => m.ChatRoomId == chatRoomId && !m.IsDeleted);

        // Filters messages older than the cursor
        if (before.HasValue)
        {
            var cursor = await _db.Messages
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    m => m.MessageId == before.Value &&
                         m.ChatRoomId == chatRoomId,
                    cancellationToken);

            if (cursor is null)
            {
                return (null, null, "INVALID_CURSOR");
            }

            query = query.Where(m =>
                m.SentAt < cursor.SentAt ||
                (m.SentAt == cursor.SentAt &&
                 m.MessageId.CompareTo(cursor.MessageId) < 0));
        }

        // Gets the newest messages within the requested range
        var messages = await query
            .Include(m => m.Student)
            .OrderByDescending(m => m.SentAt)
            .ThenByDescending(m => m.MessageId)
            .Take(limit + 1)
            .ToListAsync(cancellationToken);

        // Checks whether older messages exist
        var hasMore = messages.Count > limit;

        if (hasMore)
        {
            messages.RemoveAt(messages.Count - 1);
        }

        // Gets the cursor for the next request
        var nextBefore = hasMore
            ? messages[^1].MessageId
            : (Guid?)null;

        // Orders messages from oldest to newest
        messages.Reverse();

        return (messages, nextBefore, null);
    }
}
