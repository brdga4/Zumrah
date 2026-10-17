using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.ToTable("admin");

        builder.HasKey(admin => admin.AdminId);

        builder.Property(admin => admin.AdminId)
            .HasColumnName("admin_id")
            .HasColumnType("char(36)");

        builder.Property(admin => admin.Username)
            .HasColumnName("username")
            .HasColumnType("varchar(100)")
            .IsRequired();

        builder.Property(admin => admin.Email)
            .HasColumnName("email")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(admin => admin.PasswordHash)
            .HasColumnName("password_hash")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(admin => admin.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(admin => admin.Username)
            .IsUnique();

        builder.HasIndex(admin => admin.Email)
            .IsUnique();
    }
}
