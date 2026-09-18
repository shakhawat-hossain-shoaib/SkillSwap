using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.Models;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/bootcamps")]
public class BootcampsController : ControllerBase
{
    private readonly SkillSwapDbContext _dbContext;
    private readonly IWebHostEnvironment _env;

    public BootcampsController(SkillSwapDbContext dbContext, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _env = env;
    }

    /// <summary>
    /// Returns the root path to the physical 'bootcamps' directory.
    /// Looks at project root or current working directory.
    /// </summary>
    private string GetBootcampsRootDirectory()
    {
        var dir = new DirectoryInfo(_env.ContentRootPath);
        while (dir != null)
        {
            if (System.IO.File.Exists(Path.Combine(dir.FullName, "SkillSwap.slnx")) ||
                Directory.Exists(Path.Combine(dir.FullName, ".git")) ||
                Directory.Exists(Path.Combine(dir.FullName, "frontend")))
            {
                var repoBootcamps = Path.Combine(dir.FullName, "bootcamps");
                Directory.CreateDirectory(repoBootcamps);
                return repoBootcamps;
            }
            dir = dir.Parent;
        }

        return Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "..", "bootcamps"));
    }

    private static string SanitizeFolderName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "bootcamp-course";
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = new string(name.Where(c => !invalidChars.Contains(c)).ToArray());
        sanitized = Regex.Replace(sanitized, @"\s+", "-");
        sanitized = Regex.Replace(sanitized, @"[^a-zA-Z0-9\-_]", "");
        return string.IsNullOrWhiteSpace(sanitized) ? "bootcamp-course" : sanitized;
    }

    /// <summary>
    /// Scans the physical directory on disk for files in materials/ and assignments/
    /// </summary>
    private List<CoursePhysicalFileDto> ScanDiskMaterials(string folderName)
    {
        var result = new List<CoursePhysicalFileDto>();
        try
        {
            var root = GetBootcampsRootDirectory();
            var courseDir = Path.Combine(root, folderName);
            if (!Directory.Exists(courseDir)) return result;

            var subdirs = new[] { "materials", "assignments", "" };
            foreach (var sub in subdirs)
            {
                var targetDir = string.IsNullOrEmpty(sub) ? courseDir : Path.Combine(courseDir, sub);
                if (!Directory.Exists(targetDir)) continue;

                var files = Directory.GetFiles(targetDir);
                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    // Skip hidden or system files
                    if (fileInfo.Name.StartsWith(".")) continue;

                    result.Add(new CoursePhysicalFileDto
                    {
                        FileName = fileInfo.Name,
                        FolderCategory = string.IsNullOrEmpty(sub) ? "general" : sub,
                        RelativePath = Path.Combine("bootcamps", folderName, sub, fileInfo.Name).Replace('\\', '/'),
                        SizeBytes = fileInfo.Length,
                        FormattedSize = FormatBytes(fileInfo.Length),
                        Extension = fileInfo.Extension.TrimStart('.').ToLower(),
                        LastModified = fileInfo.LastWriteTimeUtc
                    });
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error scanning physical materials: {ex.Message}");
        }
        return result;
    }

    private static string FormatBytes(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        return $"{bytes / (1024.0 * 1024.0):F1} MB";
    }

    /// <summary>
    /// Gets all bootcamps, auto-seeding starter masterclasses if database table is empty.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllBootcamps([FromQuery] string? category = null, [FromQuery] string? difficulty = null)
    {
        await EnsureDefaultBootcampsSeededAsync();

        var query = _dbContext.Bootcamps.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(b => b.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(difficulty) && difficulty != "All")
        {
            query = query.Where(b => b.Difficulty.ToLower() == difficulty.ToLower());
        }

        var bootcamps = await query
            .OrderByDescending(b => b.BootcampId)
            .ToListAsync();

        var result = bootcamps.Select(b => MapToDetailDto(b, includeMaterials: false)).ToList();
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Gets a single bootcamp by ID or URL Slug, including disk materials.
    /// </summary>
    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetBootcampById(string idOrSlug)
    {
        await EnsureDefaultBootcampsSeededAsync();

        Bootcamp? bootcamp = null;
        if (int.TryParse(idOrSlug, out var id))
        {
            bootcamp = await _dbContext.Bootcamps.FirstOrDefaultAsync(b => b.BootcampId == id);
        }

        if (bootcamp == null)
        {
            var normalizedSlug = idOrSlug.Trim().ToLower();
            bootcamp = await _dbContext.Bootcamps.FirstOrDefaultAsync(b => b.Slug != null && b.Slug.ToLower() == normalizedSlug);
        }

        if (bootcamp == null)
        {
            return NotFound(new { success = false, message = "Bootcamp not found." });
        }

        var detail = MapToDetailDto(bootcamp, includeMaterials: true);
        return Ok(new { success = true, data = detail });
    }

    /// <summary>
    /// Admin creates a new bootcamp. Automatically generates folder structure in 'bootcamps/{name}/'.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBootcamp([FromBody] BootcampCreateUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { success = false, message = "Course title is required." });
        }

        var folderName = SanitizeFolderName(request.Title);
        var slug = folderName.ToLower();

        // Check for existing slug
        var slugExists = await _dbContext.Bootcamps.AnyAsync(b => b.Slug == slug);
        if (slugExists)
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
            folderName = $"{folderName}-{DateTime.UtcNow.Ticks % 10000}";
        }

        // Create physical directories on disk
        var rootDir = GetBootcampsRootDirectory();
        var courseDir = Path.Combine(rootDir, folderName);
        var materialsDir = Path.Combine(courseDir, "materials");
        var assignmentsDir = Path.Combine(courseDir, "assignments");

        Directory.CreateDirectory(materialsDir);
        Directory.CreateDirectory(assignmentsDir);

        // Write starter README
        var readmePath = Path.Combine(courseDir, "README.md");
        if (!System.IO.File.Exists(readmePath))
        {
            var readmeContent = $"# {request.Title}\n\n**Instructor:** {request.Instructor ?? "SkillSwap Faculty"}\n**Category:** {request.Category ?? "General"}\n**Difficulty:** {request.Difficulty ?? "Beginner"}\n\n## Materials\nPlace PDF slides, notes, or resources in the `materials/` folder.\n\n## Assignments\nPlace project briefs, code templates, or starter kits in the `assignments/` folder.\n";
            await System.IO.File.WriteAllTextAsync(readmePath, readmeContent);
        }

        var bootcamp = new Bootcamp
        {
            TopicTitle = request.Title.Trim(),
            Slug = slug,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Web Development" : request.Category.Trim(),
            Difficulty = string.IsNullOrWhiteSpace(request.Difficulty) ? "Beginner" : request.Difficulty.Trim(),
            Duration = string.IsNullOrWhiteSpace(request.Duration) ? "4 weeks" : request.Duration.Trim(),
            Instructor = string.IsNullOrWhiteSpace(request.Instructor) ? "SkillSwap Instructor" : request.Instructor.Trim(),
            InstructorAvatar = request.InstructorAvatar ?? GetInitials(request.Instructor ?? "Instructor"),
            Thumbnail = string.IsNullOrWhiteSpace(request.Thumbnail) ? "🚀" : request.Thumbnail.Trim(),
            Description = request.Description ?? string.Empty,
            ContentPath = Path.Combine("bootcamps", folderName).Replace('\\', '/'),
            Rating = request.Rating > 0 ? request.Rating : 5.0m,
            EnrolledCount = 0,
            CurriculumJson = request.CurriculumJson ?? JsonSerializer.Serialize(GetDefaultCurriculum(request.Title)),
            ScheduledTime = DateTime.UtcNow,
            MaxParticipantCap = request.MaxParticipantCap > 0 ? request.MaxParticipantCap : 50,
            CreatedAt = DateTime.UtcNow,
            OrganizerId = null
        };

        _dbContext.Bootcamps.Add(bootcamp);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBootcampById), new { idOrSlug = bootcamp.BootcampId }, new
        {
            success = true,
            message = "Bootcamp created successfully and disk directory provisioned.",
            folderPath = bootcamp.ContentPath,
            data = MapToDetailDto(bootcamp, includeMaterials: true)
        });
    }

    /// <summary>
    /// Admin updates an existing bootcamp metadata and curriculum.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBootcamp(int id, [FromBody] BootcampCreateUpdateRequest request)
    {
        var bootcamp = await _dbContext.Bootcamps.FirstOrDefaultAsync(b => b.BootcampId == id);
        if (bootcamp == null)
        {
            return NotFound(new { success = false, message = "Bootcamp not found." });
        }

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            bootcamp.TopicTitle = request.Title.Trim();
        }
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            bootcamp.Category = request.Category.Trim();
        }
        if (!string.IsNullOrWhiteSpace(request.Difficulty))
        {
            bootcamp.Difficulty = request.Difficulty.Trim();
        }
        if (!string.IsNullOrWhiteSpace(request.Duration))
        {
            bootcamp.Duration = request.Duration.Trim();
        }
        if (!string.IsNullOrWhiteSpace(request.Instructor))
        {
            bootcamp.Instructor = request.Instructor.Trim();
            bootcamp.InstructorAvatar = GetInitials(bootcamp.Instructor);
        }
        if (!string.IsNullOrWhiteSpace(request.Thumbnail))
        {
            bootcamp.Thumbnail = request.Thumbnail.Trim();
        }
        if (request.Description != null)
        {
            bootcamp.Description = request.Description;
        }
        if (!string.IsNullOrWhiteSpace(request.CurriculumJson))
        {
            bootcamp.CurriculumJson = request.CurriculumJson;
        }
        if (request.MaxParticipantCap > 0)
        {
            bootcamp.MaxParticipantCap = request.MaxParticipantCap;
        }

        bootcamp.UpdatedAt = DateTime.UtcNow;

        // Ensure physical directory exists
        var folderName = Path.GetFileName(bootcamp.ContentPath ?? SanitizeFolderName(bootcamp.TopicTitle));
        var rootDir = GetBootcampsRootDirectory();
        var courseDir = Path.Combine(rootDir, folderName);
        Directory.CreateDirectory(Path.Combine(courseDir, "materials"));
        Directory.CreateDirectory(Path.Combine(courseDir, "assignments"));

        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Bootcamp updated successfully.",
            data = MapToDetailDto(bootcamp, includeMaterials: true)
        });
    }

    /// <summary>
    /// Admin deletes a bootcamp.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBootcamp(int id)
    {
        var bootcamp = await _dbContext.Bootcamps.FirstOrDefaultAsync(b => b.BootcampId == id);
        if (bootcamp == null)
        {
            return NotFound(new { success = false, message = "Bootcamp not found." });
        }

        _dbContext.Bootcamps.Remove(bootcamp);
        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"Bootcamp '{bootcamp.TopicTitle}' deleted successfully."
        });
    }

    /// <summary>
    /// Enrolls the authenticated student into the bootcamp.
    /// </summary>
    [HttpPost("{id}/enroll")]
    public async Task<IActionResult> EnrollInBootcamp(int id)
    {
        var bootcamp = await _dbContext.Bootcamps.FirstOrDefaultAsync(b => b.BootcampId == id);
        if (bootcamp == null)
        {
            return NotFound(new { success = false, message = "Bootcamp not found." });
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int userId = 1; // Default fallback for guest/demo
        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsed))
        {
            userId = parsed;
        }

        var existingEnrollment = await _dbContext.BootcampEnrollments
            .FirstOrDefaultAsync(be => be.BootcampId == id && be.ParticipantId == userId);

        if (existingEnrollment == null)
        {
            _dbContext.BootcampEnrollments.Add(new BootcampEnrollment
            {
                BootcampId = id,
                ParticipantId = userId,
                EnrolledAt = DateTime.UtcNow
            });
            bootcamp.EnrolledCount += 1;
            await _dbContext.SaveChangesAsync();
        }

        return Ok(new
        {
            success = true,
            message = $"Enrolled successfully in {bootcamp.TopicTitle}!",
            enrolledCount = bootcamp.EnrolledCount
        });
    }

    /// <summary>
    /// Serves a physical file from the bootcamps directory for student download.
    /// </summary>
    [HttpGet("download")]
    public IActionResult DownloadMaterial([FromQuery] string file)
    {
        if (string.IsNullOrWhiteSpace(file))
        {
            return BadRequest("File path is required.");
        }

        // Prevent directory traversal
        var normalized = file.Replace('\\', '/').TrimStart('/');
        if (normalized.Contains(".."))
        {
            return BadRequest("Invalid path.");
        }

        var rootDir = GetBootcampsRootDirectory();
        var rel = normalized;
        if (rel.StartsWith("bootcamps/"))
        {
            rel = rel.Substring("bootcamps/".Length);
        }

        var fullPath = Path.GetFullPath(Path.Combine(rootDir, rel));
        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound("File not found on server.");
        }

        var fileName = Path.GetFileName(fullPath);
        var mimeType = "application/octet-stream";
        var ext = Path.GetExtension(fullPath).ToLower();
        if (ext == ".pdf") mimeType = "application/pdf";
        else if (ext == ".md" || ext == ".txt") mimeType = "text/plain";
        else if (ext == ".png") mimeType = "image/png";
        else if (ext == ".jpg" || ext == ".jpeg") mimeType = "image/jpeg";
        else if (ext == ".zip") mimeType = "application/zip";

        return PhysicalFile(fullPath, mimeType, fileName);
    }

    // ── Helper mapping methods ──────────────────────────────────────
    private object MapToDetailDto(Bootcamp b, bool includeMaterials)
    {
        var folderName = (!string.IsNullOrEmpty(b.ContentPath)
            ? b.ContentPath.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries).LastOrDefault()
            : null) ?? SanitizeFolderName(b.TopicTitle);

        var physicalMaterials = includeMaterials ? ScanDiskMaterials(folderName) : new List<CoursePhysicalFileDto>();

        return new
        {
            id = b.Slug ?? b.BootcampId.ToString(),
            bootcampId = b.BootcampId,
            title = b.TopicTitle,
            slug = b.Slug,
            description = b.Description ?? "",
            instructor = b.Instructor,
            instructorAvatar = b.InstructorAvatar ?? GetInitials(b.Instructor),
            difficulty = b.Difficulty,
            duration = b.Duration,
            category = b.Category,
            thumbnail = b.Thumbnail,
            rating = b.Rating,
            enrolledCount = b.EnrolledCount,
            maxParticipantCap = b.MaxParticipantCap,
            contentPath = b.ContentPath,
            folderName = folderName,
            physicalMaterials = physicalMaterials,
            curriculum = DeserializeCurriculum(b.CurriculumJson, b.TopicTitle),
            createdAt = b.CreatedAt,
            updatedAt = b.UpdatedAt
        };
    }

    private static object DeserializeCurriculum(string? json, string courseTitle)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return GetDefaultCurriculum(courseTitle);
        }
        try
        {
            return JsonSerializer.Deserialize<object>(json)!;
        }
        catch
        {
            return GetDefaultCurriculum(courseTitle);
        }
    }

    private static object GetDefaultCurriculum(string title)
    {
        return new
        {
            modules = new[]
            {
                new
                {
                    id = "mod-1",
                    title = "Module 1: Orientation & Foundations",
                    description = "Core theory, mental models, and environment setup.",
                    lessons = new[]
                    {
                        new
                        {
                            id = "les-101",
                            title = "1.1 Introduction & Architecture Overview",
                            duration = "45 min",
                            videoUrl = "https://www.youtube.com/watch?v=bMknfKXIFA8", // React for Beginners
                            content = $"# Welcome to {title}\n\nIn this foundational session, we break down core principles and key concepts.\n\n## Learning Outcomes:\n- Understand modern best practices.\n- Configure development tooling.\n- Write clean, production-ready code.",
                            assignment = new
                            {
                                title = "Warm-up Project: Setup & First Component",
                                description = "Clone the starter kit, configure dependencies, and verify everything builds without errors.",
                                dueDate = "Sunday, 11:59 PM",
                                points = 100
                            },
                            materials = new[]
                            {
                                new { title = "Lecture Slides (PDF)", url = "#" },
                                new { title = "Starter GitHub Template", url = "https://github.com" }
                            }
                        },
                        new
                        {
                            id = "les-102",
                            title = "1.2 Deep Dive into Real-World Patterns",
                            duration = "55 min",
                            videoUrl = "https://www.youtube.com/watch?v=SqcY0GlETPk",
                            content = "## Advanced Patterns & Architecture\n\nLearn how industry leaders structure scalable applications.\n\n```typescript\n// Example Pattern\nexport const useAppService = () => {\n  // Implementation\n};\n```",
                            assignment = new
                            {
                                title = "Assignment 2: Refactoring for Scalability",
                                description = "Extract common logic into reusable modular hooks and utilities.",
                                dueDate = "Next Wednesday",
                                points = 150
                            },
                            materials = new[]
                            {
                                new { title = "Pattern Cheatsheet", url = "#" }
                            }
                        }
                    }
                },
                new
                {
                    id = "mod-2",
                    title = "Module 2: Advanced Topics & Capstone Project",
                    description = "Putting everything together in an end-to-end production deployment.",
                    lessons = new[]
                    {
                        new
                        {
                            id = "les-201",
                            title = "2.1 Performance Optimization & Caching",
                            duration = "60 min",
                            videoUrl = "https://www.youtube.com/watch?v=RGKi6LSPDLU",
                            content = "## Performance Strategies\n\n1. Lazy loading\n2. Memoization\n3. Bundle size reduction",
                            assignment = new
                            {
                                title = "Capstone Final Submission",
                                description = "Deploy your completed application to production and submit your live URL.",
                                dueDate = "Final Milestone",
                                points = 300
                            },
                            materials = new[]
                            {
                                new { title = "Capstone Evaluation Rubric", url = "#" }
                            }
                        }
                    }
                }
            }
        };
    }

    private static string GetInitials(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "SF";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }

    private async Task EnsureDefaultBootcampsSeededAsync()
    {
        var count = await _dbContext.Bootcamps.CountAsync();
        if (count > 0) return;

        var defaults = new List<Bootcamp>
        {
            new()
            {
                TopicTitle = "React Fundamentals: From Zero to Hero",
                Slug = "react-fundamentals",
                Category = "Web Development",
                Difficulty = "Beginner",
                Duration = "6 weeks",
                Instructor = "Sarah Chen",
                InstructorAvatar = "SC",
                Thumbnail = "🚀",
                Description = "Master the fundamentals of React including components, hooks, state management, and modern patterns. Build real-world projects from scratch.",
                Rating = 4.90m,
                EnrolledCount = 342,
                MaxParticipantCap = 50,
                ContentPath = "bootcamps/React-Fundamentals",
                CurriculumJson = JsonSerializer.Serialize(GetDefaultCurriculum("React Fundamentals")),
                CreatedAt = DateTime.UtcNow,
                OrganizerId = null
            },
            new()
            {
                TopicTitle = "Python for Data Science & Machine Learning",
                Slug = "python-data-science",
                Category = "Data Science",
                Difficulty = "Intermediate",
                Duration = "8 weeks",
                Instructor = "Marcus Vance",
                InstructorAvatar = "MV",
                Thumbnail = "🐍",
                Description = "Harness the power of NumPy, Pandas, Scikit-learn, and Matplotlib to solve practical business data challenges and build predictive AI models.",
                Rating = 4.85m,
                EnrolledCount = 289,
                MaxParticipantCap = 40,
                ContentPath = "bootcamps/Python-Data-Science",
                CurriculumJson = JsonSerializer.Serialize(GetDefaultCurriculum("Python for Data Science")),
                CreatedAt = DateTime.UtcNow,
                OrganizerId = null
            },
            new()
            {
                TopicTitle = "UI/UX Design Systems with Figma",
                Slug = "ui-ux-design-systems",
                Category = "Design",
                Difficulty = "Beginner",
                Duration = "4 weeks",
                Instructor = "Elena Rostova",
                InstructorAvatar = "ER",
                Thumbnail = "🎨",
                Description = "Design beautiful, accessible, and scalable design tokens, components, and interactive prototypes used by top modern engineering teams.",
                Rating = 4.95m,
                EnrolledCount = 412,
                MaxParticipantCap = 60,
                ContentPath = "bootcamps/UI-UX-Design-Systems",
                CurriculumJson = JsonSerializer.Serialize(GetDefaultCurriculum("UI/UX Design Systems")),
                CreatedAt = DateTime.UtcNow,
                OrganizerId = null
            }
        };

        _dbContext.Bootcamps.AddRange(defaults);
        await _dbContext.SaveChangesAsync();

        // Also ensure their disk folders exist
        var root = GetBootcampsRootDirectory();
        foreach (var b in defaults)
        {
            var f = Path.GetFileName(b.ContentPath!);
            var d = Path.Combine(root, f);
            Directory.CreateDirectory(Path.Combine(d, "materials"));
            Directory.CreateDirectory(Path.Combine(d, "assignments"));
        }
    }
}

public class BootcampCreateUpdateRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Difficulty { get; set; }
    public string? Duration { get; set; }
    public string? Instructor { get; set; }
    public string? InstructorAvatar { get; set; }
    public string? Thumbnail { get; set; }
    public string? Description { get; set; }
    public decimal Rating { get; set; }
    public int MaxParticipantCap { get; set; }
    public string? CurriculumJson { get; set; }
}

public class CoursePhysicalFileDto
{
    public string FileName { get; set; } = string.Empty;
    public string FolderCategory { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string FormattedSize { get; set; } = string.Empty;
    public string Extension { get; set; } = string.Empty;
    public DateTime LastModified { get; set; }
}
