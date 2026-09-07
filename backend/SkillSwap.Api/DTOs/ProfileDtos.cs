using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.DTOs;

public class ProfileResponseDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string? BioDetails { get; set; }
    public string? ProfilePicture { get; set; }
    public string? PortfolioLinks { get; set; }
    public decimal TrustRating { get; set; }
}

public class UpdateProfileRequestDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [MaxLength(1000)]
    public string? BioDetails { get; set; }

    [MaxLength(500)]
    public string? ProfilePicture { get; set; }

    [MaxLength(2000)]
    public string? PortfolioLinks { get; set; }
}

