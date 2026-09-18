using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.Models;

public class Review
{
    public int ReviewId { get; set; }

    public int SessionId { get; set; }

    public int ReviewerId { get; set; }

    public int RevieweeId { get; set; }

    /// <summary>
    /// Rating value between 1 and 5 (inclusive).
    /// </summary>
    [Range(1, 5)]
    public int RatingValue { get; set; }

    [MaxLength(2000)]
    public string? WrittenFeedback { get; set; }

    // ── Navigation properties ──────────────────────────────────────
    public Session Session { get; set; } = null!;
    public User Reviewer { get; set; } = null!;
    public User Reviewee { get; set; } = null!;
}
