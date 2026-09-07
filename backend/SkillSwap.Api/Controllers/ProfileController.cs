using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Extensions;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;
using SkillSwap.Api.Repositories;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<UserSkill> _userSkillRepository;

    public ProfileController(
        IRepository<User> userRepository,
        IRepository<UserSkill> userSkillRepository)
    {
        _userRepository = userRepository;
        _userSkillRepository = userSkillRepository;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return NotFound(new { error = "User not found." });

        return Ok(new
        {
            success = true,
            data = new ProfileResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                BioDetails = user.BioDetails,
                ProfilePicture = user.ProfilePicture,
                PortfolioLinks = user.PortfolioLinks,
                TrustRating = user.TrustRating
            }
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = User.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return NotFound(new { error = "User not found." });

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName;
        if (request.BioDetails != null)
            user.BioDetails = request.BioDetails;
        if (request.ProfilePicture != null)
            user.ProfilePicture = request.ProfilePicture;
        if (request.PortfolioLinks != null)
            user.PortfolioLinks = request.PortfolioLinks;

        await _userRepository.UpdateAsync(user);

        return Ok(new { success = true, data = "Profile updated successfully." });
    }

    [HttpGet("me/skills")]
    public async Task<IActionResult> GetMySkills()
    {
        var userId = User.GetUserId();
        
        var userSkills = await _userSkillRepository.FindAsync(us => us.UserId == userId);

        var canTeach = userSkills
            .Where(us => us.TypeTag == SkillTypeTag.Teach)
            .Select(us => new SkillDto
            {
                UserSkillId = us.UserSkillId,
                SkillName = us.SkillName,
                TypeTag = us.TypeTag,
                ProficiencyLevel = us.ProficiencyLevel
            }).ToList();

        var wantsToLearn = userSkills
            .Where(us => us.TypeTag == SkillTypeTag.Learn)
            .Select(us => new SkillDto
            {
                UserSkillId = us.UserSkillId,
                SkillName = us.SkillName,
                TypeTag = us.TypeTag,
                ProficiencyLevel = us.ProficiencyLevel
            }).ToList();

        return Ok(new
        {
            success = true,
            data = new UserSkillsResponseDto
            {
                CanTeach = canTeach,
                WantsToLearn = wantsToLearn
            }
        });
    }

    [HttpPost("me/skills")]
    public async Task<IActionResult> AddSkill([FromBody] AddSkillRequestDto request)
    {
        var userId = User.GetUserId();

        var typeTag = request.TypeTag;
        if (!string.IsNullOrWhiteSpace(request.SkillType))
        {
            if (request.SkillType.Equals("CanTeach", StringComparison.OrdinalIgnoreCase) ||
                request.SkillType.Equals("Teach", StringComparison.OrdinalIgnoreCase))
            {
                typeTag = SkillTypeTag.Teach;
            }
            else if (request.SkillType.Equals("WantsToLearn", StringComparison.OrdinalIgnoreCase) ||
                     request.SkillType.Equals("Learn", StringComparison.OrdinalIgnoreCase))
            {
                typeTag = SkillTypeTag.Learn;
            }
        }

        var newSkill = new UserSkill
        {
            UserId = userId,
            SkillName = request.SkillName,
            TypeTag = typeTag,
            ProficiencyLevel = request.ProficiencyLevel
        };

        await _userSkillRepository.AddAsync(newSkill);
        // AddAsync already calls SaveChangesAsync

        return Ok(new
        {
            success = true,
            data = new SkillDto
            {
                UserSkillId = newSkill.UserSkillId,
                SkillName = newSkill.SkillName,
                TypeTag = newSkill.TypeTag,
                ProficiencyLevel = newSkill.ProficiencyLevel
            }
        });
    }

    [HttpDelete("me/skills/{id}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var userId = User.GetUserId();
        var skill = await _userSkillRepository.GetByIdAsync(id);

        if (skill == null || skill.UserId != userId)
            return NotFound(new { error = "Skill not found or you don't have permission to delete it." });

        await _userSkillRepository.DeleteAsync(skill);

        return Ok(new { success = true, data = "Skill deleted successfully." });
    }
}
