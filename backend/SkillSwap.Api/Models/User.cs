using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.Models;

public class User
{
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? BioDetails { get; set; }

    [MaxLength(500)]
    public string? ProfilePicture { get; set; }

    [MaxLength(2000)]
    public string? PortfolioLinks { get; set; }

    [MaxLength(200)]
    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public bool IsAdmin { get; set; } = false;

    /// <summary>
    /// Aggregated average trust rating from reviews received (1.0 – 5.0).
    /// Updated when new reviews are submitted.
    /// </summary>
    public decimal TrustRating { get; set; } = 0m;

    // ── Navigation properties ──────────────────────────────────────
    public ICollection<UserSkill> Skills { get; set; } = new List<UserSkill>();
    public ICollection<ExchangeRequest> SentRequests { get; set; } = new List<ExchangeRequest>();
    public ICollection<ExchangeRequest> ReceivedRequests { get; set; } = new List<ExchangeRequest>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    public ICollection<Bootcamp> OrganizedBootcamps { get; set; } = new List<Bootcamp>();
    public ICollection<BootcampEnrollment> Enrollments { get; set; } = new List<BootcampEnrollment>();
}
