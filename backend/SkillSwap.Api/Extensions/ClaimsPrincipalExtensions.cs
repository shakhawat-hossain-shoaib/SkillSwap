using System.Security.Claims;

namespace SkillSwap.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("id");
        if (idClaim != null && int.TryParse(idClaim.Value, out int userId))
        {
            return userId;
        }

        throw new UnauthorizedAccessException("User ID claim not found in token.");
    }
}
