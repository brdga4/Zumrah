using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Models;

namespace Zumrah.Api.Features.Students;

public class StudentService
{
    private readonly ZumrahDbContext _db;

    public StudentService(ZumrahDbContext db)
    {
        _db = db;
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

        // Changes the major if a different major was provided
        if (majorId.HasValue && (majorId.Value != student.MajorId))
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

            // Gets all student enrollments
            var enrollments = await _db.Enrollments
                .Where(e => e.StudentId == studentId)
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

        // Saves changes
        await _db.SaveChangesAsync();

        return (student, null);
    }
}
