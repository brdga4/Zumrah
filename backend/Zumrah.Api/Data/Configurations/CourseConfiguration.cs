using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("course");

        builder.HasKey(course => course.CourseId);

        builder.Property(course => course.CourseId)
            .HasColumnName("course_id")
            .HasColumnType("char(36)");

        builder.Property(course => course.CourseCode)
            .HasColumnName("course_code")
            .HasColumnType("varchar(30)")
            .IsRequired();

        builder.Property(course => course.CourseName)
            .HasColumnName("course_name")
            .HasColumnType("varchar(200)")
            .IsRequired();

        builder.Property(course => course.CreatedByAdminId)
            .HasColumnName("created_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(course => course.UpdatedByAdminId)
            .HasColumnName("updated_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(course => course.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(course => course.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("datetime");

        builder.HasIndex(course => course.CourseCode)
            .IsUnique();

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(course => course.CreatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(course => course.UpdatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);
    }
}
