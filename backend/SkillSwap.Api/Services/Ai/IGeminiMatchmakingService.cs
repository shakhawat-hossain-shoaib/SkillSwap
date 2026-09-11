namespace SkillSwap.Api.Services.Ai;

public class CandidateMatchProfile
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string BioDetails { get; set; } = string.Empty;
    public double TrustRating { get; set; } = 5.0;
    public List<string> SkillsCanTeach { get; set; } = new();
    public List<string> SkillsWantsToLearn { get; set; } = new();
}

public class AiMatchDecision
{
    public bool IsMatchFound { get; set; } = true;
    public int MatchedUserId { get; set; }
    public double MatchScore { get; set; }
    public string MatchReason { get; set; } = string.Empty;
}

public interface IGeminiMatchmakingService
{
    Task<AiMatchDecision?> FindBestMatchAsync(
        string proposerName,
        string skillOffered,
        string skillWanted,
        string goals,
        List<CandidateMatchProfile> candidates,
        CancellationToken cancellationToken = default);
}
