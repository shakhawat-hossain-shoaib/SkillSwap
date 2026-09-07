using System.ComponentModel.DataAnnotations;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.DTOs;

public class SkillDto
{
    public int UserSkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public SkillTypeTag TypeTag { get; set; }
    public ProficiencyLevel ProficiencyLevel { get; set; }
}

public class UserSkillsResponseDto
{
    public List<SkillDto> CanTeach { get; set; } = new();
    public List<SkillDto> WantsToLearn { get; set; } = new();
}

public class AddSkillRequestDto
{
    [Required]
    [MaxLength(150)]
    public string SkillName { get; set; } = string.Empty;

    public string? SkillType { get; set; }

    public SkillTypeTag TypeTag { get; set; }

    public ProficiencyLevel ProficiencyLevel { get; set; } = ProficiencyLevel.Beginner;
}

