using System.ComponentModel.DataAnnotations;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Models;

public class UserSkill
{
    public int UserSkillId { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string SkillName { get; set; } = string.Empty;

    public SkillTypeTag TypeTag { get; set; }

    public ProficiencyLevel ProficiencyLevel { get; set; }

    // ── Navigation properties ──────────────────────────────────────
    public User User { get; set; } = null!;
}
