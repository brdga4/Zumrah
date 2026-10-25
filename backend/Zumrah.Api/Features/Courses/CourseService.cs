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
}
