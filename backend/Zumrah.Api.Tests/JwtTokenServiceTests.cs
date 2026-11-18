
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Xunit;
using Zumrah.Api.Features.Auth;

public class JwtTokenServiceTests
{
    private static (JwtTokenService Service, byte[] Key) CreateService()
    {
        byte[] key = RandomNumberGenerator.GetBytes(32);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Issuer"] = "Zumrah.Tests",
                ["Jwt:Audience"] = "Zumrah.Tests.Client",
                ["Jwt:Key"] = Convert.ToBase64String(key)
            })
            .Build();

        return (new JwtTokenService(config), key);
    }

    [Fact]
    public void CreateToken_ContainsCorrectIdentityAndRole()
    {
        var (service, _) = CreateService();
        var studentId = Guid.NewGuid();
        string token = service.CreateToken(studentId, "Student");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(studentId.ToString(), jwt.Subject);
        Assert.Contains(jwt.Claims,
            claim => claim.Type == "role" && claim.Value == "Student");
    }

    [Fact]
    public void CreateToken_ExpiresAfterOneHour()
    {
        var (service, _) = CreateService();
        DateTime before = DateTime.UtcNow;
        string token = service.CreateToken(Guid.NewGuid(), "Student");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.InRange(jwt.ValidTo,
            before.AddMinutes(59),
            DateTime.UtcNow.AddMinutes(61));
    }

    [Fact]
    public void CreateToken_PassesCryptographicValidation()
    {
        var (service, key) = CreateService();
        var studentId = Guid.NewGuid();
        string token = service.CreateToken(studentId, "Student");

        var options = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "Zumrah.Tests",
            ValidateAudience = true,
            ValidAudience = "Zumrah.Tests.Client",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        var handler = new JwtSecurityTokenHandler
        {
            MapInboundClaims = false
        };

        var principal = handler.ValidateToken(token, options, out _);

        Assert.Equal(studentId.ToString(),
            principal.FindFirst("sub")?.Value);
    }
}
