namespace SkillSwap.Api.DTOs.Common;

/// <summary>
/// Consistent API response wrapper used across all endpoints.
/// </summary>
/// <typeparam name="T">Type of the response data payload.</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }

    /// <summary>Creates a successful response with data.</summary>
    public static ApiResponse<T> Ok(T data) => new()
    {
        Success = true,
        Data = data,
        Error = null
    };

    /// <summary>Creates a failure response with an error message.</summary>
    public static ApiResponse<T> Fail(string error) => new()
    {
        Success = false,
        Data = default,
        Error = error
    };
}
