namespace Zumrah.Api.Models;

public class Message
{
    public Guid MessageId { get; set; }

    public Guid ChatRoomId { get; set; }

    public Guid StudentId { get; set; }

    public Student Student { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public Guid? DeletedByAdminId { get; set; }

    public DateTime? DeletedAt { get; set; }
}
