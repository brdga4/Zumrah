using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class MajorCourseConfiguration : IEntityTypeConfiguration<MajorCourse>
{
    public void Configure(EntityTypeBuilder<MajorCourse> builder)
    {
        builder.ToTable("major_course");

        builder.HasKey(mc => mc.MajorCourseId);

        builder.Property(mc => mc.MajorCourseId)
            .HasColumnName("major_course_id")
            .HasColumnType("char(36)");

        builder.Property(mc => mc.MajorId)
            .HasColumnName("major_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(mc => mc.CourseId)
            .HasColumnName("course_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(mc => mc.AddedByAdminId)
            .HasColumnName("added_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(mc => mc.AddedAt)
            .HasColumnName("added_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(mc => new
        {
            mc.MajorId,
            mc.CourseId
        }).IsUnique();

        builder.HasOne<Major>()
            .WithMany()
            .HasForeignKey(mc => mc.MajorId)
            .IsRequired();

        builder.HasOne(mc => mc.Course)
            .WithMany()
            .HasForeignKey(mc => mc.CourseId)
            .IsRequired();

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(mc => mc.AddedByAdminId);
    }
}
