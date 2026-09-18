using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkillSwap.Api.Models;

public class Bootcamp
{
    public int BootcampId { get; set; }

    public int? OrganizerId { get; set; }

    [Required]
    [MaxLength(200)]
    public string TopicTitle { get; set; } = string.Empty;

    [NotMapped]
    public string Title
    {
        get => TopicTitle;
        set => TopicTitle = value;
    }

    [MaxLength(150)]
    public string? Slug { get; set; }

    [MaxLength(100)]
    public string Category { get; set; } = "General";

    [MaxLength(30)]
    public string Difficulty { get; set; } = "Beginner";

    [MaxLength(50)]
    public string Duration { get; set; } = "4 weeks";

    [MaxLength(100)]
    public string Instructor { get; set; } = "SkillSwap Faculty";

    [MaxLength(255)]
    public string? InstructorAvatar { get; set; }

    [MaxLength(100)]
    public string Thumbnail { get; set; } = "🚀";

    public string? Description { get; set; }

    [MaxLength(255)]
    public string? ContentPath { get; set; }

    public decimal Rating { get; set; } = 5.00m;

    public int EnrolledCount { get; set; } = 0;

    /// <summary>
    /// Structured JSON storing modules, lessons, video URLs, markdown notes, assignments, and resource links.
    /// </summary>
    public string? CurriculumJson { get; set; }

    public DateTime ScheduledTime { get; set; } = DateTime.UtcNow;

    public int MaxParticipantCap { get; set; } = 50;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // ── Navigation properties ──────────────────────────────────────
    public User? Organizer { get; set; }
    public ICollection<BootcampEnrollment> Enrollments { get; set; } = new List<BootcampEnrollment>();
}
