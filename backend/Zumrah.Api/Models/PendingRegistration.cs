namespace Zumrah.Api.Models;

public class PendingRegistration
{
    public Guid PendingRegistrationId { get; set; }

    public string UniversityEmail { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public Guid MajorId { get; set; }

    public string OtpHash { get; set; } = string.Empty;

    public DateTime OtpExpiresAt { get; set; }

    public int FailedAttempts { get; set; }

    public DateTime LastOtpSentAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public Major Major { get; set; } = null!;
}
