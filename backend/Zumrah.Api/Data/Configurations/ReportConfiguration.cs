using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Data.Configurations;

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
    {
        builder.ToTable("report");

        builder.HasKey(report => report.ReportId);

        builder.Property(report => report.ReportId)
            .HasColumnName("report_id")
            .HasColumnType("char(36)");

        builder.Property(report => report.MessageId)
            .HasColumnName("message_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(report => report.StudentId)
            .HasColumnName("student_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(report => report.Reason)
            .HasColumnName("reason")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(report => report.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasColumnType("varchar(20)")
            .HasDefaultValue(ReportStatus.PENDING)
            .IsRequired();

        builder.Property(report => report.ReviewedByAdminId)
            .HasColumnName("reviewed_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(report => report.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(report => report.ReviewedAt)
            .HasColumnName("reviewed_at")
            .HasColumnType("datetime");

        builder.HasIndex(report => new
        {
            report.StudentId,
            report.MessageId
        }).IsUnique();

        builder.HasOne(report => report.Message)
            .WithMany()
            .HasForeignKey(report => report.MessageId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(report => report.ReportedByStudent)
            .WithMany()
            .HasForeignKey(report => report.StudentId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(report => report.ReviewedByAdminId)
            .OnDelete(DeleteBehavior.ClientNoAction);
    }
}
