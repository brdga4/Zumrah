namespace Zumrah.Api.Features.Auth.Admin.Login.DTOs;

public class AdminLoginResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public AdminResponse Admin { get; set; } = new();
}

public class AdminResponse
{
    public Guid AdminId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}
