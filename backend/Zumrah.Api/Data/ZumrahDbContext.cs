using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data;

public class ZumrahDbContext : DbContext
{
    public ZumrahDbContext(DbContextOptions<ZumrahDbContext> options) : base(options)
    {
    }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<College> Colleges => Set<College>();
    public DbSet<Major> Majors => Set<Major>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<MajorCourse> MajorCourses => Set<MajorCourse>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<CourseFile> CourseFiles => Set<CourseFile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ZumrahDbContext).Assembly
        );
    }
}
