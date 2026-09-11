using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace SkillSwap.Api.Services.Ai;

public class GeminiMatchmakingService : IGeminiMatchmakingService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiMatchmakingService> _logger;

    // Technology and Skill Synonyms / Equivalences dictionary
    private static readonly Dictionary<string, string[]> SkillEquivalents = new(StringComparer.OrdinalIgnoreCase)
    {
        { "react", new[] { "react", "react.js", "reactjs", "react native", "next.js", "nextjs", "frontend" } },
        { "react.js", new[] { "react", "react.js", "reactjs", "next.js", "frontend" } },
        { "javascript", new[] { "javascript", "js", "typescript", "ts", "frontend", "web development", "node.js" } },
        { "typescript", new[] { "typescript", "ts", "javascript", "frontend" } },
        { "python", new[] { "python", "django", "fastapi", "flask", "data science", "machine learning", "pytorch" } },
        { "machine learning", new[] { "machine learning", "ml", "ai", "deep learning", "pytorch", "tensorflow", "data science" } },
        { "ai", new[] { "ai", "artificial intelligence", "machine learning", "ml", "deep learning", "nlp" } },
        { "pytorch", new[] { "pytorch", "machine learning", "deep learning", "python" } },
        { "tensorflow", new[] { "tensorflow", "machine learning", "deep learning", "python" } },
        { "ui/ux", new[] { "ui/ux", "ui design", "ux design", "figma", "product design", "wireframing" } },
        { "ui/ux design", new[] { "ui/ux", "ui design", "ux design", "figma", "product design" } },
        { "figma", new[] { "figma", "ui/ux", "ui design", "product design" } },
        { "c#", new[] { "c#", "csharp", ".net", "dotnet", "asp.net" } },
        { "csharp", new[] { "c#", "csharp", ".net", "dotnet", "asp.net" } },
        { ".net", new[] { "c#", "csharp", ".net", "dotnet", "asp.net" } },
        { "css", new[] { "css", "tailwind", "tailwind css", "html & css", "sass", "styling" } },
        { "tailwind", new[] { "tailwind", "tailwind css", "css", "styling" } },
        { "sql", new[] { "sql", "mysql", "postgresql", "postgres", "database", "sqlite" } },
        { "database", new[] { "database", "sql", "mysql", "postgresql", "mongodb" } },
        { "guitar", new[] { "guitar", "acoustic guitar", "electric guitar", "music" } },
        { "piano", new[] { "piano", "keyboard", "music" } },
        { "spanish", new[] { "spanish", "español", "conversational spanish", "language" } },
        { "french", new[] { "french", "français", "language" } },
        { "german", new[] { "german", "deutsch", "language" } },
        { "seo", new[] { "seo", "digital marketing", "marketing", "content marketing" } },
        { "public speaking", new[] { "public speaking", "presentation", "communication", "oratory" } },
    };

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "and", "the", "for", "with", "in", "to", "of", "a", "an", "basics", "basic",
        "beginner", "intermediate", "expert", "advanced", "course", "tutoring", "learning",
        "development", "programming", "skills", "skill", "training", "level"
    };

    public GeminiMatchmakingService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiMatchmakingService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AiMatchDecision?> FindBestMatchAsync(
        string proposerName,
        string skillOffered,
        string skillWanted,
        string goals,
        List<CandidateMatchProfile> candidates,
        CancellationToken cancellationToken = default)
    {
        if (candidates == null || candidates.Count == 0)
        {
            return new AiMatchDecision
            {
                IsMatchFound = false,
                MatchedUserId = 0,
                MatchScore = 0,
                MatchReason = "No candidate members are currently available in the platform."
            };
        }

        // 1. First evaluate candidate keyword matches via internal matching engine
        var heuristicResult = CalculateStrictKeywordMatch(proposerName, skillOffered, skillWanted, goals, candidates);

        // 2. If Gemini API key is available, check AI model
        var apiKey = _configuration["GEMINI_API_KEY"] ??
                     Environment.GetEnvironmentVariable("GEMINI_API_KEY") ??
                     string.Empty;

        var isRealKey = !string.IsNullOrWhiteSpace(apiKey) &&
                        !apiKey.Contains("your_gemini_api_key") &&
                        apiKey.Length > 15;

        if (isRealKey)
        {
            try
            {
                var geminiResult = await CallGeminiApiAsync(proposerName, skillOffered, skillWanted, goals, candidates, apiKey, cancellationToken);
                if (geminiResult != null)
                {
                    // If Gemini explicitly says no match found, respect it
                    if (!geminiResult.IsMatchFound || geminiResult.MatchedUserId == 0)
                    {
                        _logger.LogInformation("SwapAI determined no candidate has a proper keyword match for '{SkillWanted}'.", skillWanted);
                        return geminiResult;
                    }

                    // Verify that the candidate chosen by Gemini actually has a valid keyword match
                    var candidate = candidates.FirstOrDefault(c => c.UserId == geminiResult.MatchedUserId);
                    if (candidate != null && HasSkillKeywordMatch(skillWanted, candidate.SkillsCanTeach, candidate.BioDetails))
                    {
                        _logger.LogInformation("SwapAI verified keyword match for User #{MatchedUserId} on skill '{SkillWanted}' (Score: {Score}%)",
                            geminiResult.MatchedUserId, skillWanted, geminiResult.MatchScore);
                        return geminiResult;
                    }
                    else
                    {
                        _logger.LogWarning("SwapAI rejected model suggestion #{MatchedUserId}: candidate lacks proper keyword match for '{SkillWanted}'.",
                            geminiResult.MatchedUserId, skillWanted);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SwapAI remote API call failed. Using local keyword matchmaker.");
            }
        }

        // 3. Return the verified keyword match result
        return heuristicResult;
    }

    private async Task<AiMatchDecision?> CallGeminiApiAsync(
        string proposerName,
        string skillOffered,
        string skillWanted,
        string goals,
        List<CandidateMatchProfile> candidates,
        string apiKey,
        CancellationToken cancellationToken)
    {
        var candidatesJson = JsonSerializer.Serialize(candidates.Select(c => new
        {
            c.UserId,
            c.FullName,
            c.BioDetails,
            c.TrustRating,
            CanTeach = c.SkillsCanTeach,
            WantsToLearn = c.SkillsWantsToLearn
        }));

        var prompt = $@"
You are the intelligent skill matchmaking engine for SkillSwap (SwapAI).

PROPOSER REQUEST:
- Proposer Name: {proposerName}
- Offers to Teach: {skillOffered}
- Wants to Learn: {skillWanted}
- Learning Goals & Project Details: {goals}

CANDIDATES POOL (Registered database members):
{candidatesJson}

STRICT KEYWORD & SKILL MATCHMAKING RULES:
1. MANDATORY KEYWORD MATCH: A candidate CANNOT be matched unless they actually have expertise in '{skillWanted}'. Check their 'CanTeach' list and 'BioDetails' for relevant skill keywords (e.g. React matches React.js, Frontend; Python matches Python, Machine Learning; etc.).
2. IF NO CANDIDATE TEACHES OR KNOWS '{skillWanted}':
   You MUST return 'isMatchFound': false and 'matchedUserId': 0. DO NOT force a match or connect with an unrelated peer!
3. RECIPROCAL FIT: If multiple candidates teach '{skillWanted}', prioritize candidates who also want to learn '{skillOffered}'.
4. MatchScore must be between 75.0 and 99.0 if a genuine match is found, or 0.0 if not found.

Return ONLY a JSON object with this exact structure:
{{
  ""isMatchFound"": <true if a candidate has a valid keyword match for the skill, false otherwise>,
  ""matchedUserId"": <integer UserId of the best candidate if isMatchFound is true, or 0 if false>,
  ""matchScore"": <number between 75.0 and 99.0 if match found, or 0.0 if not found>,
  ""matchReason"": ""<explanation of why this peer has the matching skill, or why no match was found>""
}}";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.2,
                responseMimeType = "application/json"
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("SwapAI API returned status code {StatusCode}: {Error}", response.StatusCode, err);
            return null;
        }

        var jsonResponse = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(jsonResponse);

        var textElement = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(textElement)) return null;

        var result = JsonSerializer.Deserialize<GeminiJsonResponse>(textElement, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null) return null;

        if (!result.IsMatchFound || result.MatchedUserId == 0)
        {
            return new AiMatchDecision
            {
                IsMatchFound = false,
                MatchedUserId = 0,
                MatchScore = 0,
                MatchReason = !string.IsNullOrWhiteSpace(result.MatchReason)
                    ? result.MatchReason
                    : $"No matching peer found who teaches '{skillWanted}'."
            };
        }

        return new AiMatchDecision
        {
            IsMatchFound = true,
            MatchedUserId = result.MatchedUserId,
            MatchScore = Math.Round(result.MatchScore >= 75.0 ? result.MatchScore : 88.0, 1),
            MatchReason = !string.IsNullOrWhiteSpace(result.MatchReason)
                ? result.MatchReason
                : $"SwapAI matched this peer based on verified skills in {skillWanted}."
        };
    }

    /// <summary>
    /// Evaluates all candidates strictly against skill keywords.
    /// Without a proper keyword match for skillWanted, AI will NOT suggest or connect with another.
    /// </summary>
    public static AiMatchDecision CalculateStrictKeywordMatch(
        string proposerName,
        string skillOffered,
        string skillWanted,
        string goals,
        List<CandidateMatchProfile> candidates)
    {
        CandidateMatchProfile? bestCandidate = null;
        double bestScore = -1;
        string bestReason = string.Empty;

        foreach (var candidate in candidates)
        {
            // Primary test: Does candidate teach what proposer wants?
            var (teachesMatch, teachesExact, matchConfidence) = EvaluateSkillMatch(skillWanted, candidate.SkillsCanTeach, candidate.BioDetails);

            if (!teachesMatch)
            {
                // Without a proper keyword match on what user wants, this candidate is disqualified!
                continue;
            }

            // Candidate qualifies! Calculate ranking score
            double score = 70.0; // Base score for qualified keyword match
            score += matchConfidence * 15.0; // Up to +15 pts for exact/high-confidence keyword match

            // Secondary test: Reciprocal barter (does candidate want what proposer offers?)
            var (reciprocalMatch, reciprocalExact, reciprocalConfidence) = EvaluateSkillMatch(skillOffered, candidate.SkillsWantsToLearn, null);

            if (reciprocalMatch)
            {
                score += 10.0 + (reciprocalConfidence * 5.0); // +10 to +15 pts for reciprocal interest
            }

            // Trust rating bonus
            score += Math.Min(candidate.TrustRating, 5.0) * 0.8; // Up to +4 pts

            // Cap between 75.0% and 99.0%
            score = Math.Min(Math.Max(Math.Round(score, 1), 75.0), 99.0);

            if (score > bestScore)
            {
                bestScore = score;
                bestCandidate = candidate;

                if (reciprocalMatch)
                {
                    bestReason = $"Reciprocal skill match: {candidate.FullName} can teach you {skillWanted} and is actively looking to learn {skillOffered}.";
                }
                else if (teachesExact)
                {
                    bestReason = $"Direct expertise match: {candidate.FullName} specializes in {skillWanted} with a {candidate.TrustRating:F1} community rating.";
                }
                else
                {
                    bestReason = $"Skill match: {candidate.FullName} teaches complementary skills in {skillWanted} and is available for barter.";
                }
            }
        }

        // If no candidate had a proper keyword match, DO NOT SUGGEST OR CONNECT!
        if (bestCandidate == null || bestScore < 70.0)
        {
            return new AiMatchDecision
            {
                IsMatchFound = false,
                MatchedUserId = 0,
                MatchScore = 0,
                MatchReason = $"No peer in the community currently teaches '{skillWanted}'. SwapAI requires a verified skill keyword match before connecting you with a peer."
            };
        }

        return new AiMatchDecision
        {
            IsMatchFound = true,
            MatchedUserId = bestCandidate.UserId,
            MatchScore = bestScore,
            MatchReason = bestReason
        };
    }

    /// <summary>
    /// Checks whether targetSkill has a legitimate keyword match against candidateSkills or bio.
    /// </summary>
    public static bool HasSkillKeywordMatch(string targetSkill, IEnumerable<string> candidateSkills, string? bio)
    {
        var (match, _, _) = EvaluateSkillMatch(targetSkill, candidateSkills, bio);
        return match;
    }

    /// <summary>
    /// Checks for exact, token-overlap, substring, or synonym match.
    /// Returns (isMatch, isExact, confidenceMultiplier 0.0 - 1.0)
    /// </summary>
    private static (bool IsMatch, bool IsExact, double Confidence) EvaluateSkillMatch(
        string targetSkill,
        IEnumerable<string> candidateSkills,
        string? bio)
    {
        if (string.IsNullOrWhiteSpace(targetSkill)) return (false, false, 0);

        var targetNorm = NormalizeSkill(targetSkill);
        var targetTokens = ExtractKeywords(targetSkill);

        // Get target equivalents / synonyms
        var targetSynonyms = GetSynonyms(targetSkill);

        foreach (var rawSkill in candidateSkills)
        {
            if (string.IsNullOrWhiteSpace(rawSkill)) continue;

            var skillNorm = NormalizeSkill(rawSkill);

            // 1. Exact normalized match
            if (targetNorm == skillNorm)
            {
                return (true, true, 1.0);
            }

            // 2. Synonym dictionary match
            if (targetSynonyms.Contains(skillNorm))
            {
                return (true, true, 0.95);
            }

            var skillSynonyms = GetSynonyms(rawSkill);
            if (skillSynonyms.Contains(targetNorm) || targetSynonyms.Overlaps(skillSynonyms))
            {
                return (true, false, 0.9);
            }

            // 3. Substring match (for meaningful words length >= 3)
            if (targetNorm.Length >= 3 && skillNorm.Length >= 3)
            {
                if (skillNorm.Contains(targetNorm) || targetNorm.Contains(skillNorm))
                {
                    return (true, false, 0.85);
                }
            }

            // 4. Token overlap (e.g. "React Development" shares "react" with "React.js")
            var candidateTokens = ExtractKeywords(rawSkill);
            if (targetTokens.Count > 0 && candidateTokens.Count > 0)
            {
                var overlap = targetTokens.Intersect(candidateTokens, StringComparer.OrdinalIgnoreCase).ToList();
                if (overlap.Count > 0)
                {
                    double ratio = (double)overlap.Count / Math.Min(targetTokens.Count, candidateTokens.Count);
                    return (true, ratio >= 0.8, 0.75 + (ratio * 0.2));
                }
            }
        }

        // 5. Bio check: If bio explicitly mentions the skill keyword
        if (!string.IsNullOrWhiteSpace(bio) && targetTokens.Count > 0)
        {
            var bioNorm = bio.ToLower();
            bool bioMatches = targetTokens.Any(t => t.Length >= 3 && Regex.IsMatch(bioNorm, $@"\b{Regex.Escape(t)}\b"));
            if (bioMatches)
            {
                return (true, false, 0.7);
            }
        }

        return (false, false, 0);
    }

    private static string NormalizeSkill(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var lower = text.Trim().ToLower();
        // Replace punctuation (dots, slashes, dashes) with space
        lower = Regex.Replace(lower, @"[./\-_\+,]", " ");
        return Regex.Replace(lower, @"\s+", " ").Trim();
    }

    private static HashSet<string> ExtractKeywords(string text)
    {
        var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(text)) return result;

        var parts = Regex.Split(text.ToLower(), @"[^a-zA-Z0-9#+]");
        foreach (var p in parts)
        {
            var clean = p.Trim();
            if (clean.Length >= 2 && !StopWords.Contains(clean))
            {
                result.Add(clean);
            }
        }
        return result;
    }

    private static HashSet<string> GetSynonyms(string skill)
    {
        var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var norm = NormalizeSkill(skill);

        foreach (var kvp in SkillEquivalents)
        {
            if (norm == NormalizeSkill(kvp.Key) || kvp.Value.Any(v => NormalizeSkill(v) == norm))
            {
                foreach (var eq in kvp.Value)
                {
                    result.Add(NormalizeSkill(eq));
                }
            }
        }
        return result;
    }

    private class GeminiJsonResponse
    {
        [JsonPropertyName("isMatchFound")]
        public bool IsMatchFound { get; set; } = true;

        [JsonPropertyName("matchedUserId")]
        public int MatchedUserId { get; set; }

        [JsonPropertyName("matchScore")]
        public double MatchScore { get; set; }

        [JsonPropertyName("matchReason")]
        public string MatchReason { get; set; } = string.Empty;
    }
}
