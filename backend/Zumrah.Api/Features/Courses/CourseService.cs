using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Models;

namespace Zumrah.Api.Features.Courses;

public class CourseService
{
    private readonly ZumrahDbContext _db;

    public CourseService(ZumrahDbContext db)
    {
        _db = db;
    }

    public async Task<(List<MajorCourse>? MajorCourses, List<Guid> EnrolledCourseIds)> GetAvailableCoursesAsync(Guid studentId)
    {
        // Gets the authenticated student
        var student = await _db.Students
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.StudentId == studentId);

        if (student is null)
        {
            return (null, []);
        }

        // Gets all courses offered to the student's major
        var majorCourses = await _db.MajorCourses
            .Include(mc => mc.Course)
            .Where(mc => mc.MajorId == student.MajorId)
            .AsNoTracking()
            .OrderBy(mc => mc.Course.CourseCode)
            .ToListAsync();

        // Gets the IDs of courses the student is enrolled in
        var enrolledCourseIds = await _db.Enrollments
            .Where(e => e.StudentId == studentId)
            .Select(e => e.CourseId)
            .ToListAsync();

        return (majorCourses, enrolledCourseIds);
    }


    public async Task<List<Enrollment>?> GetEnrolledCoursesAsync(Guid studentId)
    {
        // Checks whether the student exists
        var studentExists = await _db.Students
            .AnyAsync(s => s.StudentId == studentId);

        if (!studentExists)
        {
            return null;
        }

        // Gets all courses the student is enrolled in
        var enrollments = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.ChatRoom)
            .Where(e => e.StudentId == studentId)
            .AsNoTracking()
            .OrderBy(e => e.Course.CourseCode)
            .ToListAsync();

        return enrollments;
    }


    public async Task<(Enrollment? Enrollment, string? Error)> CreateEnrollmentAsync(Guid studentId, Guid courseId)
    {
        // Gets the authenticated student
        var student = await _db.Students
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.StudentId == studentId);

        if (student is null)
        {
            return (null, "STUDENT_NOT_FOUND");
        }

        // Gets the requested course and its chat room
        var course = await _db.Courses
            .Include(c => c.ChatRoom)
            .SingleOrDefaultAsync(c => c.CourseId == courseId);

        if (course is null)
        {
            return (null, "COURSE_NOT_FOUND");
        }

        // Checks whether the course is offered to the student's major
        var isOffered = await _db.MajorCourses
            .AnyAsync(mc => mc.MajorId == student.MajorId && mc.CourseId == courseId);

        if (!isOffered)
        {
            return (null, "COURSE_NOT_AVAILABLE");
        }

        // Checks whether the student is already enrolled
        var alreadyEnrolled = await _db.Enrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);

        if (alreadyEnrolled)
        {
            return (null, "ALREADY_ENROLLED");
        }

        // Checks whether the course has an active chat room
        if (course.ChatRoom is null || !course.ChatRoom.IsActive)
        {
            return (null, "COURSE_CHAT_ROOM_UNAVAILABLE");
        }

        // Creates the new enrollment
        var enrollment = new Enrollment
        {
            EnrollmentId = Guid.NewGuid(),
            StudentId = studentId,
            CourseId = courseId,
            Course = course,
            EnrolledAt = DateTime.UtcNow
        };

        // Adds the enrollment to EF Core's change tracker
        _db.Enrollments.Add(enrollment);

        // Saves the enrollment to MySQL
        await _db.SaveChangesAsync();

        return (enrollment, null);
    }
}
