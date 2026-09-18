using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.DTOs;

public class SubmitReviewDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
    public int RatingValue { get; set; }

    [MaxLength(2000)]
    public string? WrittenFeedback { get; set; }
}

public class ReviewItemDto
{
    public int ReviewId { get; set; }
    public int SessionId { get; set; }
    public int RequestId { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewerAvatar { get; set; } = string.Empty;
    public int RevieweeId { get; set; }
    public string RevieweeName { get; set; } = string.Empty;
    public string RevieweeAvatar { get; set; } = string.Empty;
    public int RatingValue { get; set; }
    public string? WrittenFeedback { get; set; }
}

public class ExchangeRatingStatusDto
{
    public int RequestId { get; set; }
    public bool CanRate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public string PartnerAvatar { get; set; } = string.Empty;
    public decimal PartnerTrustRating { get; set; }
    public ReviewItemDto? MyReviewGiven { get; set; }
    public ReviewItemDto? ReviewReceived { get; set; }
}
