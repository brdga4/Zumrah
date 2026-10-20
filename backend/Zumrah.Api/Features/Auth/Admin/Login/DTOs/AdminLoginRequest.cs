namespace Zumrah.Api.Features.Auth.Admin.Login.DTOs;

public class AdminLoginRequest
{
    public string Identifier { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
