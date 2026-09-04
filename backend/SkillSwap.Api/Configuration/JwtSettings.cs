namespace SkillSwap.Api.Configuration;

/// <summary>
/// Configuration POCO bound from appsettings.json "JwtSettings" section.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 1440; // 24 hours default
}
