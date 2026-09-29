using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;
using SkillSwap.Api.Services.Auth;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly SkillSwapDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AdminController(
        SkillSwapDbContext dbContext,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Authenticates an administrator against the Admins table in the database.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        var normalizedEmail = request.Email.Trim().ToLower();

        // 1. First look up in the dedicated Admins database table
        var admin = await _dbContext.Admins
            .FirstOrDefaultAsync(a => a.EmailAddress.ToLower() == normalizedEmail);

        if (admin != null)
        {
            if (!_passwordHasher.VerifyPassword(request.Password, admin.PasswordHash))
            {
                return Unauthorized(new { success = false, message = "Invalid admin email or password." });
            }

            var token = _tokenService.GenerateToken(admin);

            return Ok(new
            {
                success = true,
                token,
                admin = new
                {
                    adminId = admin.AdminId,
                    fullName = admin.FullName,
                    email = admin.EmailAddress,
                    role = admin.Role
                }
            });
        }

        // 2. Fallback: check if the user is marked as IsAdmin = true in Users table
        var adminUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.EmailAddress.ToLower() == normalizedEmail && u.IsAdmin);

        if (adminUser != null && _passwordHasher.VerifyPassword(request.Password, adminUser.PasswordHash))
        {
            // Sync into Admins table
            admin = new Admin
            {
                FullName = adminUser.FullName,
                EmailAddress = adminUser.EmailAddress,
                PasswordHash = adminUser.PasswordHash,
                Role = "SuperAdmin"
            };
            _dbContext.Admins.Add(admin);
            await _dbContext.SaveChangesAsync();

            var token = _tokenService.GenerateToken(admin);

            return Ok(new
            {
                success = true,
                token,
                admin = new
                {
                    adminId = admin.AdminId,
                    fullName = admin.FullName,
                    email = admin.EmailAddress,
                    role = admin.Role
                }
            });
        }

        return Unauthorized(new { success = false, message = "Admin account not found or credentials invalid." });
    }

    /// <summary>
    /// Returns the list of all system admins registered in the database.
    /// </summary>
    [HttpGet("list")]
    public async Task<IActionResult> GetAdminsList()
    {
        var admins = await _dbContext.Admins
            .OrderBy(a => a.AdminId)
            .Select(a => new
            {
                adminId = a.AdminId,
                fullName = a.FullName,
                email = a.EmailAddress,
                role = a.Role,
                createdAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = admins });
    }

    /// <summary>
    /// Registers a new admin account in the database.
    /// </summary>
    [HttpPost("create")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        var normalizedEmail = request.Email.Trim().ToLower();

        if (!SkillSwap.Api.Common.SecurityHelper.IsValidEmail(normalizedEmail))
        {
            return BadRequest(new { success = false, message = "Please provide a valid admin email address." });
        }

        if (!SkillSwap.Api.Common.SecurityHelper.ValidatePasswordStrength(request.Password, out var passErr))
        {
            return BadRequest(new { success = false, message = passErr });
        }

        var exists = await _dbContext.Admins.AnyAsync(a => a.EmailAddress.ToLower() == normalizedEmail);
        if (exists)
        {
            return BadRequest(new { success = false, message = "An admin with this email already exists." });
        }

        var newAdmin = new Admin
        {
            FullName = SkillSwap.Api.Common.SecurityHelper.SanitizeInput(request.FullName),
            EmailAddress = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Admin" : request.Role.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Admins.Add(newAdmin);
        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Admin account created successfully.",
            data = new
            {
                adminId = newAdmin.AdminId,
                fullName = newAdmin.FullName,
                email = newAdmin.EmailAddress,
                role = newAdmin.Role
            }
        });
    }

    /// <summary>
    /// Returns all registered users with their skills for administrative inspection.
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _dbContext.Users
            .Include(u => u.Skills)
            .Include(u => u.ReviewsReceived)
            .OrderBy(u => u.UserId)
            .ToListAsync();

        var result = users.Select(u => new ChatUserDto
        {
            UserId = u.UserId,
            FullName = u.FullName,
            EmailAddress = u.EmailAddress,
            Avatar = GetInitials(u.FullName),
            BioDetails = u.BioDetails ?? string.Empty,
            TrustRating = u.TrustRating,
            TotalReviewsReceived = u.ReviewsReceived.Count,
            SkillsCanTeach = u.Skills
                .Where(s => s.TypeTag == SkillTypeTag.Teach)
                .Select(s => s.SkillName)
                .ToList(),
            SkillsWantsToLearn = u.Skills
                .Where(s => s.TypeTag == SkillTypeTag.Learn)
                .Select(s => s.SkillName)
                .ToList(),
            LastMessage = "Registered Member",
            LastMessageTime = null,
            UnreadCount = 0,
            IsOnline = true
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Returns all exchange connections across the entire system.
    /// </summary>
    [HttpGet("connections")]
    public async Task<IActionResult> GetAllConnections()
    {
        var requests = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .OrderByDescending(er => er.CreatedAt)
            .ToListAsync();

        var result = requests.Select(r => new
        {
            id = r.RequestId,
            user1Id = r.SenderId,
            user1Name = r.Sender?.FullName ?? $"User #{r.SenderId}",
            user1Email = r.Sender?.EmailAddress ?? "",
            user1Avatar = GetInitials(r.Sender?.FullName),
            user1Rating = r.Sender?.TrustRating ?? 5.0m,
            user2Id = r.ReceiverId,
            user2Name = r.Receiver?.FullName ?? $"User #{r.ReceiverId}",
            user2Email = r.Receiver?.EmailAddress ?? "",
            user2Avatar = GetInitials(r.Receiver?.FullName),
            user2Rating = r.Receiver?.TrustRating ?? 5.0m,
            connectionType = "Exchange Request",
            status = r.Status.ToString(),
            details = r.LearningGoals,
            time = r.CreatedAt.ToString("g")
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Returns all reviews and star ratings across the platform.
    /// </summary>
    [HttpGet("reviews")]
    public async Task<IActionResult> GetAllReviews()
    {
        var reviews = await _dbContext.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .Include(r => r.Session)
            .OrderByDescending(r => r.ReviewId)
            .Select(r => new
            {
                reviewId = r.ReviewId,
                sessionId = r.SessionId,
                requestId = r.Session.RequestId,
                reviewerId = r.ReviewerId,
                reviewerName = r.Reviewer.FullName,
                reviewerEmail = r.Reviewer.EmailAddress,
                reviewerAvatar = GetInitials(r.Reviewer.FullName),
                revieweeId = r.RevieweeId,
                revieweeName = r.Reviewee.FullName,
                revieweeEmail = r.Reviewee.EmailAddress,
                revieweeAvatar = GetInitials(r.Reviewee.FullName),
                ratingValue = r.RatingValue,
                writtenFeedback = r.WrittenFeedback ?? string.Empty
            })
            .ToListAsync();

        return Ok(new { success = true, data = reviews });
    }

    /// <summary>
    /// Returns aggregate counts for administrative dashboard.
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _dbContext.Users.CountAsync();
        var totalSkills = await _dbContext.UserSkills.CountAsync();
        var totalRequests = await _dbContext.ExchangeRequests.CountAsync();
        var activeRequests = await _dbContext.ExchangeRequests
            .CountAsync(r => r.Status == ExchangeRequestStatus.Accepted || r.Status == ExchangeRequestStatus.InProgress);
        var totalReviews = await _dbContext.Reviews.CountAsync();
        double averageRating = 5.0;
        if (totalReviews > 0)
        {
            averageRating = Math.Round(await _dbContext.Reviews.AverageAsync(r => (double)r.RatingValue), 2);
        }
        else
        {
            var userRatings = await _dbContext.Users
                .Where(u => u.TrustRating > 0)
                .Select(u => (double)u.TrustRating)
                .ToListAsync();
            if (userRatings.Count > 0)
            {
                averageRating = Math.Round(userRatings.Average(), 2);
            }
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers,
                totalSkills,
                totalRequests,
                activeRequests,
                totalReviews,
                averageRating
            }
        });
    }

    private static string GetInitials(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "U";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}

public class AdminLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class CreateAdminRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
}
