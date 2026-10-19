using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollment");

        builder.HasKey(enrollment => enrollment.EnrollmentId);

        builder.Property(enrollment => enrollment.EnrollmentId)
            .HasColumnName("enrollment_id")
            .HasColumnType("char(36)");

        builder.Property(enrollment => enrollment.StudentId)
            .HasColumnName("student_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(enrollment => enrollment.CourseId)
            .HasColumnName("course_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(enrollment => enrollment.EnrolledAt)
            .HasColumnName("enrolled_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(enrollment => new
        {
            enrollment.StudentId,
            enrollment.CourseId
        }).IsUnique();

        builder.HasOne<Student>()
            .WithMany()
            .HasForeignKey(enrollment => enrollment.StudentId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(enrollment => enrollment.Course)
            .WithMany()
            .HasForeignKey(enrollment => enrollment.CourseId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}
