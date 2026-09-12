using System.ComponentModel.DataAnnotations;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Models;

public class Session
{
    public int SessionId { get; set; }

    public int RequestId { get; set; }

    public DateTime ScheduledDateTime { get; set; }

    [MaxLength(500)]
    public string? MeetingLink { get; set; }

    public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

    // ── Navigation properties ──────────────────────────────────────
    public ExchangeRequest ExchangeRequest { get; set; } = null!;
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
