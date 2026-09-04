using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkillSwap.Api.DTOs;

public class RegisterRequestDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    [MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequestDto
{
    public string? Email { get; set; }

    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthUserDataDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
}

public class AuthResponseDto
{
    public bool Success { get; set; }
    public AuthUserDataDto? Data { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public string? Error { get; set; }
}

