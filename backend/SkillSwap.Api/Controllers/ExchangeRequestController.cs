using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Extensions;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;
using SkillSwap.Api.Repositories;
using SkillSwap.Api.Services.Ai;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/exchange-requests")]
[Authorize]
public class ExchangeRequestController : ControllerBase
{
    private readonly IRepository<ExchangeRequest> _exchangeRequestRepository;
    private readonly IRepository<User> _userRepository;
    private readonly SkillSwapDbContext _dbContext;
    private readonly IGeminiMatchmakingService _geminiService;

    public ExchangeRequestController(
        IRepository<ExchangeRequest> exchangeRequestRepository,
        IRepository<User> userRepository,
        SkillSwapDbContext dbContext,
        IGeminiMatchmakingService geminiService)
    {
        _exchangeRequestRepository = exchangeRequestRepository;
        _userRepository = userRepository;
        _dbContext = dbContext;
        _geminiService = geminiService;
    }

    /// <summary>
    /// Proposes a new skill swap evaluated and matched automatically by SwapAI.
    /// The user specifies what they teach and want to learn; SwapAI routes it to the optimal peer.
    /// </summary>
    [HttpPost("ai-propose")]
    public async Task<IActionResult> ProposeAiSwap([FromBody] ProposeAiSwapDto request)
    {
        var senderId = User.GetUserId();

        var proposer = await _dbContext.Users
            .Include(u => u.Skills)
            .FirstOrDefaultAsync(u => u.UserId == senderId);

        if (proposer == null)
            return Unauthorized(new { error = "Proposer user not found." });

        // Retrieve potential candidate peers from database (excluding the proposer and admins)
        var candidates = await _dbContext.Users
            .Include(u => u.Skills)
            .Where(u => u.UserId != senderId && !u.IsAdmin)
            .Select(u => new CandidateMatchProfile
            {
                UserId = u.UserId,
                FullName = u.FullName,
                BioDetails = u.BioDetails ?? string.Empty,
                TrustRating = (double)u.TrustRating,
                SkillsCanTeach = u.Skills.Where(s => s.TypeTag == SkillTypeTag.Teach).Select(s => s.SkillName).ToList(),
                SkillsWantsToLearn = u.Skills.Where(s => s.TypeTag == SkillTypeTag.Learn).Select(s => s.SkillName).ToList()
            })
            .ToListAsync();

        if (candidates.Count == 0)
        {
            return BadRequest(new { error = "No other registered members available in the platform to match with." });
        }

        // Run SwapAI Matchmaker
        var matchDecision = await _geminiService.FindBestMatchAsync(
            proposer.FullName,
            request.SkillOffered,
            request.SkillWanted,
            request.LearningGoals,
            candidates,
            HttpContext.RequestAborted);

        if (matchDecision == null || !matchDecision.IsMatchFound || matchDecision.MatchedUserId == 0)
        {
            var reason = matchDecision?.MatchReason;
            if (string.IsNullOrWhiteSpace(reason))
            {
                reason = $"No matching peer found who teaches \"{request.SkillWanted}\". Without a proper skill keyword match, SwapAI will not connect you with another peer. Try searching with common skill keywords (e.g. React.js, Python, UI/UX Design, TypeScript, Machine Learning).";
            }

            return BadRequest(new { error = reason });
        }

        var matchedUser = await _dbContext.Users.FindAsync(matchDecision.MatchedUserId);
        if (matchedUser == null)
        {
            return BadRequest(new { error = "Matched candidate could not be retrieved from database." });
        }

        // Encode match details into learning goals text for traceability
        var encodedGoals = $"[SwapAI Match: {matchDecision.MatchScore}% - {matchDecision.MatchReason}] {request.SkillOffered} ⇄ {request.SkillWanted}: {request.LearningGoals}";

        var newExchange = new ExchangeRequest
        {
            SenderId = senderId,
            ReceiverId = matchDecision.MatchedUserId,
            LearningGoals = encodedGoals,
            EstimatedDuration = string.IsNullOrWhiteSpace(request.EstimatedDuration) ? "4 weeks" : request.EstimatedDuration,
            Status = ExchangeRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ExchangeRequests.Add(newExchange);
        await _dbContext.SaveChangesAsync();

        var dto = MapToDto(newExchange, senderId, proposer, matchedUser, matchDecision.MatchScore, matchDecision.MatchReason);

        return Ok(new
        {
            success = true,
            data = new AiMatchResultDto
            {
                MatchedUserId = matchedUser.UserId,
                MatchedUserName = matchedUser.FullName,
                MatchedUserAvatar = GetInitials(matchedUser.FullName),
                MatchScore = matchDecision.MatchScore,
                MatchReason = matchDecision.MatchReason,
                ExchangeRequest = dto
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateExchangeRequest([FromBody] CreateExchangeRequestDto request)
    {
        var senderId = User.GetUserId();

        if (senderId == request.ReceiverId)
            return BadRequest(new { error = "You cannot send an exchange request to yourself." });

        var receiver = await _userRepository.GetByIdAsync(request.ReceiverId);
        if (receiver == null)
            return NotFound(new { error = "Receiver not found." });

        var sender = await _userRepository.GetByIdAsync(senderId);

        var newRequest = new ExchangeRequest
        {
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            LearningGoals = request.LearningGoals,
            EstimatedDuration = request.EstimatedDuration,
            Status = ExchangeRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _exchangeRequestRepository.AddAsync(newRequest);

        return Ok(new
        {
            success = true,
            data = MapToDto(newRequest, senderId, sender, receiver)
        });
    }

    [HttpGet("sent")]
    public async Task<IActionResult> GetSentRequests()
    {
        var senderId = User.GetUserId();
        var requests = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
            .Where(er => er.SenderId == senderId)
            .OrderByDescending(er => er.CreatedAt)
            .ToListAsync();

        var data = requests.Select(er => MapToDto(er, senderId, er.Sender, er.Receiver)).ToList();

        return Ok(new { success = true, data });
    }

    [HttpGet("received")]
    public async Task<IActionResult> GetReceivedRequests()
    {
        var receiverId = User.GetUserId();
        var requests = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
            .Where(er => er.ReceiverId == receiverId)
            .OrderByDescending(er => er.CreatedAt)
            .ToListAsync();

        var data = requests.Select(er => MapToDto(er, receiverId, er.Sender, er.Receiver)).ToList();

        return Ok(new { success = true, data });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateExchangeRequestStatusDto requestDto)
    {
        var userId = User.GetUserId();
        var exchangeRequest = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
            .FirstOrDefaultAsync(er => er.RequestId == id);

        if (exchangeRequest == null)
            return NotFound(new { error = "Exchange request not found." });

        try
        {
            exchangeRequest.TransitionTo(requestDto.Status, userId);

            if (requestDto.Status == ExchangeRequestStatus.Accepted)
            {
                var hasSession = await _dbContext.Sessions.AnyAsync(s => s.RequestId == exchangeRequest.RequestId);
                if (!hasSession)
                {
                    _dbContext.Sessions.Add(new Session
                    {
                        RequestId = exchangeRequest.RequestId,
                        ScheduledDateTime = DateTime.UtcNow,
                        Status = SessionStatus.Scheduled
                    });
                }
            }
            else if (requestDto.Status == ExchangeRequestStatus.Completed)
            {
                var session = exchangeRequest.Sessions.FirstOrDefault();
                if (session == null)
                {
                    session = new Session
                    {
                        RequestId = exchangeRequest.RequestId,
                        ScheduledDateTime = DateTime.UtcNow,
                        Status = SessionStatus.Completed
                    };
                    _dbContext.Sessions.Add(session);
                }
                else
                {
                    session.Status = SessionStatus.Completed;
                }
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                data = MapToDto(exchangeRequest, userId, exchangeRequest.Sender, exchangeRequest.Receiver)
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private static ExchangeRequestDto MapToDto(
        ExchangeRequest er,
        int? currentUserId = null,
        User? sender = null,
        User? receiver = null,
        double? overrideScore = null,
        string? overrideReason = null)
    {
        // Extract AI match metadata if present in LearningGoals
        double score = overrideScore ?? 94.0;
        string? reason = overrideReason;

        if (overrideScore == null && er.LearningGoals.StartsWith("[AI Match:"))
        {
            var endIdx = er.LearningGoals.IndexOf(']');
            if (endIdx > 10)
            {
                var tag = er.LearningGoals.Substring(1, endIdx - 1);
                var parts = tag.Replace("AI Match:", "").Split('-', 2);
                if (parts.Length > 0 && double.TryParse(parts[0].Replace("%", "").Trim(), out var parsedScore))
                {
                    score = parsedScore;
                }
                if (parts.Length > 1)
                {
                    reason = parts[1].Trim();
                }
            }
        }

        int? myRating = null;
        int? partnerRating = null;
        if (currentUserId.HasValue && er.Sessions != null)
        {
            var allReviews = er.Sessions.SelectMany(s => s.Reviews).ToList();
            var myRev = allReviews.FirstOrDefault(r => r.ReviewerId == currentUserId.Value);
            var partnerRev = allReviews.FirstOrDefault(r => r.RevieweeId == currentUserId.Value);
            if (myRev != null) myRating = myRev.RatingValue;
            if (partnerRev != null) partnerRating = partnerRev.RatingValue;
        }

        return new ExchangeRequestDto
        {
            RequestId = er.RequestId,
            SenderId = er.SenderId,
            SenderName = sender?.FullName ?? $"User #{er.SenderId}",
            SenderAvatar = GetInitials(sender?.FullName),
            ReceiverId = er.ReceiverId,
            ReceiverName = receiver?.FullName ?? $"User #{er.ReceiverId}",
            ReceiverAvatar = GetInitials(receiver?.FullName),
            LearningGoals = er.LearningGoals,
            EstimatedDuration = er.EstimatedDuration,
            Status = er.Status,
            CreatedAt = er.CreatedAt,
            MatchScore = score,
            MatchReason = reason,
            MyRating = myRating,
            PartnerRating = partnerRating
        };
    }

    private static string GetInitials(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "U";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
