using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("student");

        builder.HasKey(student => student.StudentId);

        builder.Property(student => student.StudentId)
            .HasColumnName("student_id")
            .HasColumnType("char(36)");

        builder.Property(student => student.MicrosoftObjectId)
            .HasColumnName("microsoft_object_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(student => student.UniversityEmail)
            .HasColumnName("university_email")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(student => student.Name)
            .HasColumnName("name")
            .HasColumnType("varchar(200)")
            .IsRequired();

        builder.Property(student => student.MajorId)
            .HasColumnName("major_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(student => student.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(student => student.MicrosoftObjectId)
            .IsUnique();

        builder.HasIndex(student => student.UniversityEmail)
            .IsUnique();

        builder.HasOne(student => student.Major)
            .WithMany()
            .HasForeignKey(student => student.MajorId)
            .IsRequired();
    }
}
