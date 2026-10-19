using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class CollegeConfiguration : IEntityTypeConfiguration<College>
{
    public void Configure(EntityTypeBuilder<College> builder)
    {
        builder.ToTable("college");

        builder.HasKey(college => college.CollegeId);

        builder.Property(college => college.CollegeId)
            .HasColumnName("college_id")
            .HasColumnType("char(36)");

        builder.Property(college => college.CollegeName)
            .HasColumnName("college_name")
            .HasColumnType("varchar(200)")
            .IsRequired();

        builder.Property(college => college.CreatedByAdminId)
            .HasColumnName("created_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(college => college.UpdatedByAdminId)
            .HasColumnName("updated_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(college => college.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(college => college.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("datetime");

        builder.HasIndex(college => college.CollegeName)
            .IsUnique();

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(college => college.CreatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(college => college.UpdatedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);
    }
}
