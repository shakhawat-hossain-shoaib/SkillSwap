namespace SkillSwap.Api.Services.Auth;

public class PasswordHasher : IPasswordHasher
{
    // Work factor of 12 is a good balance between security and performance.
    private const int WorkFactor = 12;

    /// <inheritdoc />
    public string HashPassword(string plainText)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainText, WorkFactor);
    }

    /// <inheritdoc />
    public bool VerifyPassword(string plainText, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(plainText, hash);
    }
}
