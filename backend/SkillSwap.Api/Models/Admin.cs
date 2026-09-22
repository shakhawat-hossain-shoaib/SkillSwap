using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.Models;

public class Admin
{
    public int AdminId { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Role { get; set; } = "Admin"; // "SuperAdmin", "Admin", "Moderator"

    [MaxLength(200)]
    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
