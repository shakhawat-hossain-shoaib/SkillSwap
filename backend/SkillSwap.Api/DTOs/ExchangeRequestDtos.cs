using System.ComponentModel.DataAnnotations;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.DTOs;

public class ExchangeRequestDto
{
    public int RequestId { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderAvatar { get; set; } = string.Empty;
    public int ReceiverId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverAvatar { get; set; } = string.Empty;
    public string LearningGoals { get; set; } = string.Empty;
    public string EstimatedDuration { get; set; } = string.Empty;
    public ExchangeRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public double MatchScore { get; set; } = 95.0;
    public string? MatchReason { get; set; }
    public int? MyRating { get; set; }
    public int? PartnerRating { get; set; }
}

public class CreateExchangeRequestDto
{
    [Required]
    public int ReceiverId { get; set; }

    [Required]
    public string LearningGoals { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EstimatedDuration { get; set; } = string.Empty;
}

public class ProposeAiSwapDto
{
    [Required(ErrorMessage = "Skill offered to teach is required.")]
    public string SkillOffered { get; set; } = string.Empty;

    [Required(ErrorMessage = "Skill wanted in return is required.")]
    public string SkillWanted { get; set; } = string.Empty;

    [Required(ErrorMessage = "Learning goals and details are required.")]
    public string LearningGoals { get; set; } = string.Empty;

    public string EstimatedDuration { get; set; } = "4 weeks";
}

public class AiMatchResultDto
{
    public int MatchedUserId { get; set; }
    public string MatchedUserName { get; set; } = string.Empty;
    public string MatchedUserAvatar { get; set; } = string.Empty;
    public double MatchScore { get; set; }
    public string MatchReason { get; set; } = string.Empty;
    public ExchangeRequestDto ExchangeRequest { get; set; } = null!;
}

public class UpdateExchangeRequestStatusDto
{
    [Required]
    public ExchangeRequestStatus Status { get; set; }
}
