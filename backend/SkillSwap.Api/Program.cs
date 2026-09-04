using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SkillSwap.Api.Configuration;
using SkillSwap.Api.Data;
using SkillSwap.Api.Hubs;
using SkillSwap.Api.Middleware;
using SkillSwap.Api.Repositories;
using SkillSwap.Api.Services.Ai;
using SkillSwap.Api.Services.Auth;

// Load backend-specific environment variables from .env if present
var localEnvPath = Path.Combine(AppContext.BaseDirectory, ".env");
var rootOrLocalEnv = File.Exists(".env") ? ".env" : (File.Exists(localEnvPath) ? localEnvPath : null);

if (rootOrLocalEnv != null && File.Exists(rootOrLocalEnv))
{
    foreach (var line in File.ReadAllLines(rootOrLocalEnv))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        var parts = trimmed.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim();
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
            {
                Environment.SetEnvironmentVariable(key, val);
            }
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// ════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ════════════════════════════════════════════════════════════════════
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()!;

// ════════════════════════════════════════════════════════════════════
//  DATABASE — MySQL via EF Core
// ════════════════════════════════════════════════════════════════════
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddDbContext<SkillSwapDbContext>(options =>
    options.UseMySQL(connectionString));

// ════════════════════════════════════════════════════════════════════
//  DEPENDENCY INJECTION — Services & Repositories
// ════════════════════════════════════════════════════════════════════
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

// Gemini AI Matchmaking Service with HttpClient
builder.Services.AddHttpClient<IGeminiMatchmakingService, GeminiMatchmakingService>();

// SignalR for real-time live chat & notifications
builder.Services.AddSignalR();

// ════════════════════════════════════════════════════════════════════
//  AUTHENTICATION — JWT Bearer
// ════════════════════════════════════════════════════════════════════
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero // No tolerance for token expiry
    };

    // Support JWT tokens sent via SignalR WebSocket query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && 
                (path.StartsWithSegments("/hubs/chat") || path.StartsWithSegments("/api/hubs/chat")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));
});

// ════════════════════════════════════════════════════════════════════
//  CORS — Allow React/TS frontend
// ════════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ════════════════════════════════════════════════════════════════════
//  CONTROLLERS + JSON
// ════════════════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings in API responses
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ════════════════════════════════════════════════════════════════════
//  SWAGGER / OPENAPI — with JWT Bearer support
// ════════════════════════════════════════════════════════════════════
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SkillSwap API",
        Version = "v1",
        Description = "AI-powered peer-to-peer cashless skill exchange platform — \"Learn More. Spend Less.\""
    });

    // JWT Bearer token support in Swagger UI
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter your JWT token: **Bearer {token}**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    options.AddSecurityDefinition("Bearer", securityScheme);
    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
});

// ════════════════════════════════════════════════════════════════════
//  BUILD APP
// ════════════════════════════════════════════════════════════════════
var app = builder.Build();

// ── Global error handler (first in pipeline to catch everything) ──
app.UseGlobalExceptionHandler();

// ── Swagger (all environments for now, restrict in prod later) ────
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SkillSwap API v1");
    options.RoutePrefix = "swagger";
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<ChatHub>("/api/hubs/chat");

app.Run();
