using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class PendingRegistrationConfiguration : IEntityTypeConfiguration<PendingRegistration>
{
    public void Configure(EntityTypeBuilder<PendingRegistration> builder)
    {
        builder.ToTable("pending_registration");

        builder.HasKey(pending => pending.PendingRegistrationId);

        builder.Property(pending => pending.PendingRegistrationId)
            .HasColumnName("pending_registration_id")
            .HasColumnType("char(36)");

        builder.Property(pending => pending.UniversityEmail)
            .HasColumnName("university_email")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(pending => pending.Name)
            .HasColumnName("name")
            .HasColumnType("varchar(200)")
            .IsRequired();

        builder.Property(pending => pending.PasswordHash)
            .HasColumnName("password_hash")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(pending => pending.MajorId)
            .HasColumnName("major_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(pending => pending.OtpHash)
            .HasColumnName("otp_hash")
            .HasColumnType("char(64)")
            .IsRequired();

        builder.Property(pending => pending.OtpExpiresAt)
            .HasColumnName("otp_expires_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(pending => pending.FailedAttempts)
            .HasColumnName("failed_attempts")
            .HasColumnType("int")
            .IsRequired();

        builder.Property(pending => pending.LastOtpSentAt)
            .HasColumnName("last_otp_sent_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(pending => pending.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(pending => pending.UniversityEmail)
            .IsUnique();

        builder.HasOne(pending => pending.Major)
            .WithMany()
            .HasForeignKey(pending => pending.MajorId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}
