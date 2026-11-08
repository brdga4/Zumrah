using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Chat;
using Zumrah.Api.Models;

namespace Zumrah.Api.Features.Students;

public class StudentService
{
    private readonly ZumrahDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext;

    public StudentService(
        ZumrahDbContext db,
        IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<Student?> GetProfileAsync(Guid studentId)
    {
        return await _db.Students
            .Include(s => s.Major)
                .ThenInclude(m => m.College)
            .Include(s => s.Major)
                .ThenInclude(m => m.ChatRoom)
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.StudentId == studentId);
    }

    public async Task<(Student? Student, string? Error)> UpdateProfileAsync(Guid studentId, string? name, Guid? majorId)
    {
        // Gets the student and related information
        var student = await _db.Students
            .Include(s => s.Major)
                .ThenInclude(m => m.College)
            .Include(s => s.Major)
                .ThenInclude(m => m.ChatRoom)
            .SingleOrDefaultAsync(s => s.StudentId == studentId);

        if (student is null)
        {
            return (null, "STUDENT_NOT_FOUND");
        }

        var major = student.Major;

        // Rooms to revoke if the student changes major
        List<Guid> roomsToRevoke = [];

        // Changes the major if a different major was provided
        if (majorId.HasValue && majorId.Value != student.MajorId)
        {
            var newMajor = await _db.Majors
                .Include(m => m.College)
                .Include(m => m.ChatRoom)
                .SingleOrDefaultAsync(m => m.MajorId == majorId.Value);

            if (newMajor is null)
            {
                return (null, "MAJOR_NOT_FOUND");
            }

            if (newMajor.ChatRoom is null)
            {
                return (null, "MAJOR_CHAT_ROOM_MISSING");
            }

            // Remember the old major before changing it
            var oldMajorId = student.MajorId;

            // Gets all student enrollments
            var enrollments = await _db.Enrollments
                .Where(e => e.StudentId == studentId)
                .ToListAsync();

            // Collects the IDs of previously enrolled courses
            var oldCourseIds = enrollments
                .Select(e => e.CourseId)
                .ToList();

            // Finds the old major and course chat rooms
            roomsToRevoke = await _db.ChatRooms
                .AsNoTracking()
                .Where(room =>
                    room.MajorId == oldMajorId ||
                    (room.CourseId.HasValue &&
                     oldCourseIds.Contains(room.CourseId.Value)))
                .Select(room => room.ChatRoomId)
                .ToListAsync();

            // Removes all enrollments
            _db.Enrollments.RemoveRange(enrollments);

            // Updates the student's major
            student.MajorId = newMajor.MajorId;
            student.Major = newMajor;
            major = newMajor;
        }

        // Checks the major's chat room
        if (major.ChatRoom is null)
        {
            return (null, "MAJOR_CHAT_ROOM_MISSING");
        }

        // Changes the name if provided
        if (name is not null)
        {
            student.Name = name.Trim();
        }

        // Saves changes to MySQL
        await _db.SaveChangesAsync();

        // Revokes old room memberships after a successful major change
        if (roomsToRevoke.Count > 0)
        {
            await ChatHub.RevokeRoomAccessAsync(
                _hubContext,
                studentId,
                roomsToRevoke
            );
        }

        return (student, null);
    }
}
