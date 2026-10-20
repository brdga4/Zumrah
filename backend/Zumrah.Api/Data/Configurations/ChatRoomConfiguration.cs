using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zumrah.Api.Models;

namespace Zumrah.Api.Data.Configurations;

public class ChatRoomConfiguration : IEntityTypeConfiguration<ChatRoom>
{
    public void Configure(EntityTypeBuilder<ChatRoom> builder)
    {
        builder.ToTable("chat_room", table =>
        {
            table.HasCheckConstraint(
                "chk_chat_room_owner",
                @"(
                    (room_type = 'COURSE'
                        AND course_id IS NOT NULL
                        AND major_id IS NULL)
                    OR
                    (room_type = 'MAJOR'
                        AND major_id IS NOT NULL
                        AND course_id IS NULL)
                )");
        });

        builder.HasKey(room => room.ChatRoomId);

        builder.Property(room => room.ChatRoomId)
            .HasColumnName("chat_room_id")
            .HasColumnType("char(36)");

        builder.Property(room => room.RoomType)
            .HasColumnName("room_type")
            .HasConversion<string>()
            .HasColumnType("varchar(10)")
            .IsRequired();

        builder.Property(room => room.CourseId)
            .HasColumnName("course_id")
            .HasColumnType("char(36)");

        builder.Property(room => room.MajorId)
            .HasColumnName("major_id")
            .HasColumnType("char(36)");

        builder.Property(room => room.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(room => room.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime")
            .IsRequired();

        builder.HasIndex(room => room.CourseId)
            .IsUnique();

        builder.HasIndex(room => room.MajorId)
            .IsUnique();

        builder.HasOne<Course>()
            .WithOne(course => course.ChatRoom)
            .HasForeignKey<ChatRoom>(room => room.CourseId);

        builder.HasOne<Major>()
            .WithOne(major => major.ChatRoom)
            .HasForeignKey<ChatRoom>(room => room.MajorId);
    }
}
