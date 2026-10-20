using System.Security.Cryptography;
using System.Text;

namespace Zumrah.Api.Features.Auth;

public class OtpService
{
    private readonly byte[] _key;

    public OtpService(IConfiguration configuration)
    {
        string secret = configuration["Otp:HmacKey"] ?? throw new InvalidOperationException(
                "OTP HMAC key is missing.");

        _key = Convert.FromBase64String(secret);

        if (_key.Length < 32)
        {
            throw new InvalidOperationException(
                "OTP HMAC key must be at least 32 bytes.");
        }
    }

    public string GenerateCode()
    {
        int number = RandomNumberGenerator.GetInt32(0, 1_000_000);

        return number.ToString("D6");
    }

    public string HashCode(
        Guid pendingRegistrationId,
        string email,
        string code)
    {
        string normalizedEmail = email.Trim().ToLowerInvariant();

        string data = $"{pendingRegistrationId:N}:{normalizedEmail}:{code}";

        byte[] hash = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(data));

        return Convert.ToHexString(hash);
    }

    public bool VerifyCode(
        Guid pendingRegistrationId,
        string email,
        string code,
        string storedHash)
    {
        if (code.Length != 6 || !code.All(char.IsAsciiDigit))
        {
            return false;
        }

        string calculatedHash = HashCode(
            pendingRegistrationId,
            email,
            code);

        return CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(calculatedHash),
            Encoding.ASCII.GetBytes(storedHash));
    }
}
