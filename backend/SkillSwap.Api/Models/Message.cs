using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Api.Models;

public class Message
{
    public int MessageId { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    [Required]
    [MaxLength(4000)]
    public string MessageBody { get; set; } = string.Empty;

    public DateTime SentTimestamp { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;

    // ── Navigation properties ──────────────────────────────────────
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}
