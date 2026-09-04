namespace SkillSwap.Api.Services.Auth;

public interface IPasswordHasher
{
    /// <summary>
    /// Hashes a plain-text password using BCrypt.
    /// </summary>
    string HashPassword(string plainText);

    /// <summary>
    /// Verifies a plain-text password against a BCrypt hash.
    /// </summary>
    bool VerifyPassword(string plainText, string hash);
}
