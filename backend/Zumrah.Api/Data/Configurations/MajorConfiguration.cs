using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class MajorConfiguration : IEntityTypeConfiguration<Major>
{
    public void Configure(EntityTypeBuilder<Major> builder)
    {
        builder.ToTable("major");

        builder.HasKey(major => major.MajorId);

        builder.Property(major => major.MajorId)
            .HasColumnName("major_id")
            .HasColumnType("char(36)");

        builder.Property(major => major.CollegeId)
            .HasColumnName("college_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(major => major.MajorName)
            .HasColumnName("major_name")
            .HasColumnType("varchar(200)")
            .IsRequired();

        builder.Property(major => major.CreatedByAdminId)
            .HasColumnName("created_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(major => major.UpdatedByAdminId)
            .HasColumnName("updated_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(major => major.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(major => major.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("datetime");

        builder.HasIndex(major => new
        {
            major.CollegeId,
            major.MajorName
        }).IsUnique();

        builder.HasOne(major => major.College)
            .WithMany(college => college.Majors)
            .HasForeignKey(major => major.CollegeId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(major => major.CreatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(major => major.UpdatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);
    }
}
