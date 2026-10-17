using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Models;

public class ChatRoom
{
    public Guid ChatRoomId { get; set; }

    public RoomType RoomType { get; set; }

    public Guid? CourseId { get; set; }

    public Guid? MajorId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
}
