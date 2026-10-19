using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Data.Configurations;

public class CourseFileConfiguration : IEntityTypeConfiguration<CourseFile>
{
    public void Configure(EntityTypeBuilder<CourseFile> builder)
    {
        builder.ToTable("course_file");

        builder.HasKey(file => file.FileId);

        builder.Property(file => file.FileId)
            .HasColumnName("file_id")
            .HasColumnType("char(36)");

        builder.Property(file => file.CourseId)
            .HasColumnName("course_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(file => file.UploadedByStudentId)
            .HasColumnName("uploaded_by_student_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(file => file.FileName)
            .HasColumnName("file_name")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(file => file.BlobPath)
            .HasColumnName("blob_path")
            .HasColumnType("varchar(500)")
            .IsRequired();

        builder.Property(file => file.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasColumnType("varchar(10)")
            .HasDefaultValue(FileStatus.PENDING)
            .IsRequired();

        builder.Property(file => file.ReviewedByAdminId)
            .HasColumnName("reviewed_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(file => file.UploadedAt)
            .HasColumnName("uploaded_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(file => file.ReviewedAt)
            .HasColumnName("reviewed_at")
            .HasColumnType("datetime");

        builder.HasIndex(file => file.BlobPath)
            .IsUnique();

        builder.HasOne(file => file.Course)
            .WithMany()
            .HasForeignKey(file => file.CourseId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(file => file.UploadedByStudent)
            .WithMany()
            .HasForeignKey(file => file.UploadedByStudentId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(file => file.ReviewedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);
    }
}
