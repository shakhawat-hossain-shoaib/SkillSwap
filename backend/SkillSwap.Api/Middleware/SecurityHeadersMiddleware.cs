namespace SkillSwap.Api.Middleware;

/// <summary>
/// Hardens HTTP responses by adding security headers to mitigate common web vulnerabilities
/// including XSS, Clickjacking, MIME-sniffing, and Information Disclosure.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Prevent MIME-type sniffing
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // 2. Prevent clickjacking by denying iframe embedding
        context.Response.Headers.Append("X-Frame-Options", "DENY");

        // 3. Enable cross-site scripting filter
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // 4. Control referrer information passed in requests
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // 5. Restrict browser features and APIs
        context.Response.Headers.Append("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");

        // 6. Content Security Policy for API responses
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");

        // 7. Prevent server fingerprinting
        context.Response.Headers.Remove("Server");
        context.Response.Headers.Remove("X-Powered-By");

        await _next(context);
    }
}
