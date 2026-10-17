using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("message");

        builder.HasKey(message => message.MessageId);

        builder.Property(message => message.MessageId)
            .HasColumnName("message_id")
            .HasColumnType("char(36)");

        builder.Property(message => message.ChatRoomId)
            .HasColumnName("chat_room_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(message => message.StudentId)
            .HasColumnName("student_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(message => message.Content)
            .HasColumnName("content")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(message => message.SentAt)
            .HasColumnName("sent_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(message => message.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(message => message.DeletedByAdminId)
            .HasColumnName("deleted_by_admin_id")
            .HasColumnType("char(36)");

        builder.Property(message => message.DeletedAt)
            .HasColumnName("deleted_at")
            .HasColumnType("datetime");

        builder.HasOne<ChatRoom>()
            .WithMany()
            .HasForeignKey(message => message.ChatRoomId)
            .IsRequired();

        builder.HasOne(message => message.Student)
            .WithMany()
            .HasForeignKey(message => message.StudentId)
            .IsRequired();

        builder.HasOne<Admin>()
            .WithMany()
            .HasForeignKey(message => message.DeletedByAdminId);
    }
}
