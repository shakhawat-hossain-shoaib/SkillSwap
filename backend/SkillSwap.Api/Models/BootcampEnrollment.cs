namespace SkillSwap.Api.Models;

public class BootcampEnrollment
{
    public int EnrollmentId { get; set; }

    public int BootcampId { get; set; }

    public int ParticipantId { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    // ── Navigation properties ──────────────────────────────────────
    public Bootcamp Bootcamp { get; set; } = null!;
    public User Participant { get; set; } = null!;
}
