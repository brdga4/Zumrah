
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Xunit;
using Zumrah.Api.Features.Auth;

public class OtpServiceTests
{
    private static OtpService CreateService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Otp:HmacKey"] = Convert.ToBase64String(
                    RandomNumberGenerator.GetBytes(32))
            })
            .Build();

        return new OtpService(config);
    }

    [Fact]
    public void GenerateCode_ReturnsSixDigits()
    {
        var service = CreateService();
        string code = service.GenerateCode();

        Assert.Matches("^[0-9]{6}$", code);
    }

    [Fact]
    public void VerifyCode_AcceptsCorrectCode()
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        string email = "123456789@student.ksu.edu.sa";
        string hash = service.HashCode(id, email, "123456");

        Assert.True(service.VerifyCode(
            id, email, "123456", hash));
    }

    [Fact]
    public void VerifyCode_RejectsIncorrectCode()
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        string email = "123456789@student.ksu.edu.sa";
        string hash = service.HashCode(id, email, "123456");

        Assert.False(service.VerifyCode(
            id, email, "999999", hash));
    }

    [Fact]
    public void VerifyCode_RejectsDifferentRegistrationId()
    {
        var service = CreateService();
        string email = "123456789@student.ksu.edu.sa";
        var originalId = Guid.NewGuid();
        string hash = service.HashCode(originalId, email, "123456");

        Assert.False(service.VerifyCode(
            Guid.NewGuid(), email, "123456", hash));
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("abcdef")]
    public void VerifyCode_RejectsInvalidFormat(string code)
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        string email = "123456789@student.ksu.edu.sa";
        string hash = service.HashCode(id, email, "123456");

        Assert.False(service.VerifyCode(
            id, email, code, hash));
    }
}
