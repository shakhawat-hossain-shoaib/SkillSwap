using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace SkillSwap.Api.Common;

/// <summary>
/// Provides security utilities for input sanitization, password strength validation, and email validation.
/// </summary>
public static class SecurityHelper
{
    private static readonly Regex HtmlTagRegex = new(@"<[^>]*>", RegexOptions.Compiled);
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Strips harmful HTML tags and encodes dangerous characters to prevent Stored XSS.
    /// </summary>
    public static string SanitizeInput(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Strip HTML tags
        var stripped = HtmlTagRegex.Replace(input.Trim(), string.Empty);
        // HTML encode any remaining characters
        return HtmlEncoder.Default.Encode(stripped);
    }

    /// <summary>
    /// Validates password complexity:
    /// - Minimum 8 characters
    /// - At least one uppercase letter (A-Z)
    /// - At least one lowercase letter (a-z)
    /// - At least one digit (0-9)
    /// - At least one special character (!@#$%^&*...)
    /// </summary>
    public static bool ValidatePasswordStrength(string? password, out string? errorMessage)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            errorMessage = "Password cannot be empty.";
            return false;
        }

        if (password.Length < 8)
        {
            errorMessage = "Password must be at least 8 characters long.";
            return false;
        }

        if (!password.Any(char.IsUpper))
        {
            errorMessage = "Password must contain at least one uppercase letter (A-Z).";
            return false;
        }

        if (!password.Any(char.IsLower))
        {
            errorMessage = "Password must contain at least one lowercase letter (a-z).";
            return false;
        }

        if (!password.Any(char.IsDigit))
        {
            errorMessage = "Password must contain at least one numerical digit (0-9).";
            return false;
        }

        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
        {
            errorMessage = "Password must contain at least one special character (!@#$%^&*...).";
            return false;
        }

        errorMessage = null;
        return true;
    }

    /// <summary>
    /// Validates that an email conforms to standard email format.
    /// </summary>
    public static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        return EmailRegex.IsMatch(email.Trim());
    }
}
