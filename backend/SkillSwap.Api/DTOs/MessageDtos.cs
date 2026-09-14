using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.DTOs;

public class SendMessageRequestDto
{
    [Required]
    public int ReceiverId { get; set; }

    [Required]
    [MaxLength(4000)]
    public string MessageBody { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public int MessageId { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderAvatar { get; set; } = string.Empty;
    public int ReceiverId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverAvatar { get; set; } = string.Empty;
    public string MessageBody { get; set; } = string.Empty;
    public DateTime SentTimestamp { get; set; }
    public bool IsRead { get; set; }
    public bool IsMe { get; set; }
}

public class ChatUserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string? BioDetails { get; set; }
    public decimal TrustRating { get; set; }
    public int TotalReviewsReceived { get; set; }
    public List<string> SkillsCanTeach { get; set; } = new();
    public List<string> SkillsWantsToLearn { get; set; } = new();
    public string LastMessage { get; set; } = string.Empty;
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public bool IsOnline { get; set; } = true;
}
