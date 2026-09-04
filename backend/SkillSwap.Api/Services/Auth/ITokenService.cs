using SkillSwap.Api.Models;

namespace SkillSwap.Api.Services.Auth;

public interface ITokenService
{
    /// <summary>
    /// Generates a JWT for the given user, including role claims.
    /// </summary>
    string GenerateToken(User user);

    /// <summary>
    /// Generates a JWT for the given admin user.
    /// </summary>
    string GenerateToken(Admin admin);
}
