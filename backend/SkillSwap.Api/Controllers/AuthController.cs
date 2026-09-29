using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Models;
using SkillSwap.Api.Repositories;
using SkillSwap.Api.Services.Auth;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth-policy")]
public class AuthController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthController(
        IRepository<User> userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var email = (!string.IsNullOrWhiteSpace(request.EmailAddress) ? request.EmailAddress : request.Email)?.Trim();
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new AuthResponseDto { Success = false, Error = "Email is required." });
        }

        if (!SkillSwap.Api.Common.SecurityHelper.IsValidEmail(email))
        {
            return BadRequest(new AuthResponseDto { Success = false, Error = "Please enter a valid email address." });
        }

        if (!SkillSwap.Api.Common.SecurityHelper.ValidatePasswordStrength(request.Password, out var passwordError))
        {
            return BadRequest(new AuthResponseDto { Success = false, Error = passwordError });
        }

        var existingUsers = await _userRepository.FindAsync(u => u.EmailAddress == email);
        var existingUser = existingUsers.FirstOrDefault();
        if (existingUser != null)
        {
            return BadRequest(new AuthResponseDto { Success = false, Error = "Email already in use." });
        }

        var sanitizedFullName = SkillSwap.Api.Common.SecurityHelper.SanitizeInput(request.FullName);
        if (string.IsNullOrWhiteSpace(sanitizedFullName))
        {
            sanitizedFullName = "SkillSwap Member";
        }

        var newUser = new User
        {
            FullName = sanitizedFullName,
            EmailAddress = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            RefreshToken = Guid.NewGuid().ToString(),
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7)
        };

        await _userRepository.AddAsync(newUser);
        // AddAsync already calls SaveChangesAsync

        var token = _tokenService.GenerateToken(newUser);

        return Ok(new AuthResponseDto
        {
            Success = true,
            Token = token,
            RefreshToken = newUser.RefreshToken,
            Data = new AuthUserDataDto
            {
                Id = newUser.UserId,
                FullName = newUser.FullName,
                Email = newUser.EmailAddress,
                Token = token,
                RefreshToken = newUser.RefreshToken
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var email = !string.IsNullOrWhiteSpace(request.EmailAddress) ? request.EmailAddress : request.Email;
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new AuthResponseDto { Success = false, Error = "Email is required." });
        }

        var users = await _userRepository.FindAsync(u => u.EmailAddress == email);
        var user = users.FirstOrDefault();
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new AuthResponseDto { Success = false, Error = "Invalid email or password." });
        }

        // Generate a new refresh token on login
        user.RefreshToken = Guid.NewGuid().ToString();
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Success = true,
            Token = token,
            RefreshToken = user.RefreshToken,
            Data = new AuthUserDataDto
            {
                Id = user.UserId,
                FullName = user.FullName,
                Email = user.EmailAddress,
                Token = token,
                RefreshToken = user.RefreshToken
            }
        });
    }

    [HttpPost("demo")]
    public async Task<IActionResult> DemoLogin()
    {
        const string demoEmail = "demo@skillswap.app";
        var existingUsers = await _userRepository.FindAsync(u => u.EmailAddress == demoEmail);
        var demoUser = existingUsers.FirstOrDefault();

        if (demoUser == null)
        {
            demoUser = new User
            {
                FullName = "Alex Morgan",
                EmailAddress = demoEmail,
                PasswordHash = _passwordHasher.HashPassword("DemoPass123!"),
                BioDetails = "Full-stack developer passionate about skill sharing and peer learning.",
                PortfolioLinks = "https://github.com,https://linkedin.com",
                RefreshToken = Guid.NewGuid().ToString(),
                RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30)
            };
            await _userRepository.AddAsync(demoUser);
        }

        var token = _tokenService.GenerateToken(demoUser);

        return Ok(new AuthResponseDto
        {
            Success = true,
            Token = token,
            RefreshToken = demoUser.RefreshToken,
            Data = new AuthUserDataDto
            {
                Id = demoUser.UserId,
                FullName = demoUser.FullName,
                Email = demoUser.EmailAddress,
                Token = token,
                RefreshToken = demoUser.RefreshToken
            }
        });
    }
}


