using System.ComponentModel.DataAnnotations;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Models;

public class ExchangeRequest
{
    public int RequestId { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public ExchangeRequestStatus Status { get; set; } = ExchangeRequestStatus.Pending;

    [Required]
    public string LearningGoals { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EstimatedDuration { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation properties ──────────────────────────────────────
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
    public ICollection<Session> Sessions { get; set; } = new List<Session>();

    // ── Domain Methods ─────────────────────────────────────────────
    public void TransitionTo(ExchangeRequestStatus newStatus, int userId)
    {
        if (Status == newStatus) return;

        bool isReceiver = userId == ReceiverId;
        bool isSender = userId == SenderId;

        if (!isReceiver && !isSender)
            throw new UnauthorizedAccessException("Only the sender or receiver can modify this request.");

        switch (Status)
        {
            case ExchangeRequestStatus.Pending:
                // Only receiver can Accept or Decline
                if (newStatus == ExchangeRequestStatus.Accepted || newStatus == ExchangeRequestStatus.Declined)
                {
                    if (!isReceiver) throw new UnauthorizedAccessException("Only the receiver can accept or decline a pending request.");
                    Status = newStatus;
                    break;
                }
                if (newStatus == ExchangeRequestStatus.Cancelled)
                {
                    if (!isSender) throw new UnauthorizedAccessException("Only the sender can cancel a pending request.");
                    Status = newStatus;
                    break;
                }
                throw new InvalidOperationException($"Cannot transition from Pending to {newStatus}.");

            case ExchangeRequestStatus.Accepted:
                if (newStatus == ExchangeRequestStatus.InProgress ||
                    newStatus == ExchangeRequestStatus.Completed ||
                    newStatus == ExchangeRequestStatus.Cancelled)
                {
                    Status = newStatus;
                    break;
                }
                throw new InvalidOperationException($"Cannot transition from Accepted to {newStatus}.");

            case ExchangeRequestStatus.InProgress:
                if (newStatus == ExchangeRequestStatus.Completed || newStatus == ExchangeRequestStatus.Cancelled)
                {
                    Status = newStatus;
                    break;
                }
                throw new InvalidOperationException($"Cannot transition from InProgress to {newStatus}.");

            case ExchangeRequestStatus.Completed:
                if (newStatus == ExchangeRequestStatus.Completed) break;
                throw new InvalidOperationException($"Exchange barter is already completed.");

            default:
                throw new InvalidOperationException($"Cannot transition from terminal state {Status}.");
        }
    }
}
