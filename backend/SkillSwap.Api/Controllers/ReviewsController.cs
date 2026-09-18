using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Extensions;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly SkillSwapDbContext _dbContext;

    public ReviewsController(SkillSwapDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Rates the peer participant on an accepted exchange request (1 to 5 stars).
    /// Recalculates the peer's overall trust rating.
    /// </summary>
    [HttpPost("exchange-requests/{requestId}/rate")]
    public async Task<IActionResult> RateExchangePartner(int requestId, [FromBody] SubmitReviewDto dto)
    {
        var currentUserId = User.GetUserId();

        // 1. Try lookup by RequestId
        var exchange = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
            .FirstOrDefaultAsync(er => er.RequestId == requestId);

        // 2. Fallback: requestId may be the peer's UserId (e.g. from chat page)
        if (exchange == null)
        {
            exchange = await _dbContext.ExchangeRequests
                .Include(er => er.Sender)
                .Include(er => er.Receiver)
                .Include(er => er.Sessions)
                    .ThenInclude(s => s.Reviews)
                .Where(er => (er.SenderId == requestId && er.ReceiverId == currentUserId) ||
                             (er.ReceiverId == requestId && er.SenderId == currentUserId))
                .OrderByDescending(er => er.Status == ExchangeRequestStatus.Accepted ? 1 : 0)
                .ThenByDescending(er => er.CreatedAt)
                .FirstOrDefaultAsync();
        }

        // 3. Fallback: If no exchange exists yet but requestId is a valid user, create an accepted barter connection
        if (exchange == null)
        {
            var peerUser = await _dbContext.Users.FindAsync(requestId);
            if (peerUser != null && peerUser.UserId != currentUserId)
            {
                exchange = new ExchangeRequest
                {
                    SenderId = currentUserId,
                    ReceiverId = peerUser.UserId,
                    Status = ExchangeRequestStatus.Accepted,
                    EstimatedDuration = "Ongoing Barter",
                    LearningGoals = "Mutual Skill Exchange Collaboration",
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.ExchangeRequests.Add(exchange);
                await _dbContext.SaveChangesAsync();

                var newSession = new Session
                {
                    RequestId = exchange.RequestId,
                    ScheduledDateTime = DateTime.UtcNow,
                    Status = SessionStatus.Completed
                };
                _dbContext.Sessions.Add(newSession);
                await _dbContext.SaveChangesAsync();

                exchange = await _dbContext.ExchangeRequests
                    .Include(er => er.Sender)
                    .Include(er => er.Receiver)
                    .Include(er => er.Sessions)
                        .ThenInclude(s => s.Reviews)
                    .FirstOrDefaultAsync(er => er.RequestId == exchange.RequestId);
            }
        }

        if (exchange == null)
            return NotFound(new { success = false, message = "Exchange request or partner user not found." });

        if (exchange.SenderId != currentUserId && exchange.ReceiverId != currentUserId)
            return Forbid("You can only rate exchange requests you are a part of.");

        // If status was Pending, auto-accept so rating can proceed
        if (exchange.Status == ExchangeRequestStatus.Pending)
        {
            exchange.Status = ExchangeRequestStatus.Accepted;
            await _dbContext.SaveChangesAsync();
        }

        var revieweeId = currentUserId == exchange.SenderId ? exchange.ReceiverId : exchange.SenderId;
        var revieweeUser = await _dbContext.Users.FindAsync(revieweeId);
        var reviewerUser = await _dbContext.Users.FindAsync(currentUserId);

        if (revieweeUser == null || reviewerUser == null)
            return BadRequest(new { success = false, message = "Invalid participant accounts." });

        // Ensure a Session exists for this ExchangeRequest so that the foreign key SessionId is satisfied
        var session = exchange.Sessions.FirstOrDefault();
        if (session == null)
        {
            session = new Session
            {
                RequestId = exchange.RequestId,
                ScheduledDateTime = DateTime.UtcNow,
                Status = SessionStatus.Completed
            };
            _dbContext.Sessions.Add(session);
            await _dbContext.SaveChangesAsync();
        }

        // Find or create Review
        var review = await _dbContext.Reviews
            .FirstOrDefaultAsync(r => r.SessionId == session.SessionId && r.ReviewerId == currentUserId);

        if (review != null)
        {
            review.RatingValue = dto.RatingValue;
            review.WrittenFeedback = dto.WrittenFeedback?.Trim();
        }
        else
        {
            review = new Review
            {
                SessionId = session.SessionId,
                ReviewerId = currentUserId,
                RevieweeId = revieweeId,
                RatingValue = dto.RatingValue,
                WrittenFeedback = dto.WrittenFeedback?.Trim()
            };
            _dbContext.Reviews.Add(review);
        }

        await _dbContext.SaveChangesAsync();

        // Recalculate reviewee overall TrustRating
        var revieweeRatings = await _dbContext.Reviews
            .Where(r => r.RevieweeId == revieweeId)
            .Select(r => r.RatingValue)
            .ToListAsync();

        decimal updatedTrustRating = revieweeRatings.Count > 0
            ? (decimal)Math.Round(revieweeRatings.Average(), 2)
            : 5.0m;

        revieweeUser.TrustRating = updatedTrustRating;
        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"Successfully submitted {dto.RatingValue}-star rating for {revieweeUser.FullName}!",
            data = new
            {
                reviewId = review.ReviewId,
                requestId = exchange.RequestId,
                ratingValue = review.RatingValue,
                writtenFeedback = review.WrittenFeedback,
                revieweeId = revieweeId,
                revieweeName = revieweeUser.FullName,
                partnerTrustRating = updatedTrustRating,
                totalReviewsReceived = revieweeRatings.Count
            }
        });
    }

    /// <summary>
    /// Gets ratings status for a specific exchange request (ratings given and received).
    /// </summary>
    [HttpGet("exchange-requests/{requestId}/ratings")]
    public async Task<IActionResult> GetExchangeRatings(int requestId)
    {
        var currentUserId = User.GetUserId();

        // 1. Lookup by RequestId
        var exchange = await _dbContext.ExchangeRequests
            .Include(er => er.Sender)
            .Include(er => er.Receiver)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
                    .ThenInclude(r => r.Reviewer)
            .Include(er => er.Sessions)
                .ThenInclude(s => s.Reviews)
                    .ThenInclude(r => r.Reviewee)
            .FirstOrDefaultAsync(er => er.RequestId == requestId);

        // 2. Fallback: Lookup by peer's UserId
        if (exchange == null)
        {
            exchange = await _dbContext.ExchangeRequests
                .Include(er => er.Sender)
                .Include(er => er.Receiver)
                .Include(er => er.Sessions)
                    .ThenInclude(s => s.Reviews)
                        .ThenInclude(r => r.Reviewer)
                .Include(er => er.Sessions)
                    .ThenInclude(s => s.Reviews)
                        .ThenInclude(r => r.Reviewee)
                .Where(er => (er.SenderId == requestId && er.ReceiverId == currentUserId) ||
                             (er.ReceiverId == requestId && er.SenderId == currentUserId))
                .OrderByDescending(er => er.Status == ExchangeRequestStatus.Accepted ? 1 : 0)
                .ThenByDescending(er => er.CreatedAt)
                .FirstOrDefaultAsync();
        }

        // 3. Fallback: If not found, check if partner user exists
        if (exchange == null)
        {
            var partnerUser = await _dbContext.Users.FindAsync(requestId);
            if (partnerUser != null && partnerUser.UserId != currentUserId)
            {
                return Ok(new
                {
                    success = true,
                    data = new ExchangeRatingStatusDto
                    {
                        RequestId = 0,
                        CanRate = true,
                        Status = "Accepted",
                        PartnerId = partnerUser.UserId,
                        PartnerName = partnerUser.FullName,
                        PartnerAvatar = GetInitials(partnerUser.FullName),
                        PartnerTrustRating = partnerUser.TrustRating,
                        MyReviewGiven = null,
                        ReviewReceived = null
                    }
                });
            }

            return NotFound(new { success = false, message = "Exchange request not found." });
        }

        if (exchange.SenderId != currentUserId && exchange.ReceiverId != currentUserId)
            return Forbid("You can only view ratings for your own exchanges.");

        var isAcceptedOrBeyond = exchange.Status == ExchangeRequestStatus.Accepted ||
                                 exchange.Status == ExchangeRequestStatus.InProgress ||
                                 exchange.Status == ExchangeRequestStatus.Completed;

        var partnerId = currentUserId == exchange.SenderId ? exchange.ReceiverId : exchange.SenderId;
        var partner = currentUserId == exchange.SenderId ? exchange.Receiver : exchange.Sender;

        var allReviews = exchange.Sessions.SelectMany(s => s.Reviews).ToList();

        var myReview = allReviews.FirstOrDefault(r => r.ReviewerId == currentUserId);
        var partnerReview = allReviews.FirstOrDefault(r => r.ReviewerId == partnerId);

        return Ok(new
        {
            success = true,
            data = new ExchangeRatingStatusDto
            {
                RequestId = exchange.RequestId,
                CanRate = isAcceptedOrBeyond,
                Status = exchange.Status.ToString(),
                PartnerId = partnerId,
                PartnerName = partner?.FullName ?? $"User #{partnerId}",
                PartnerAvatar = GetInitials(partner?.FullName),
                PartnerTrustRating = partner?.TrustRating ?? 5.0m,
                MyReviewGiven = myReview == null ? null : new ReviewItemDto
                {
                    ReviewId = myReview.ReviewId,
                    SessionId = myReview.SessionId,
                    RequestId = exchange.RequestId,
                    ReviewerId = myReview.ReviewerId,
                    ReviewerName = myReview.Reviewer?.FullName ?? "Me",
                    ReviewerAvatar = GetInitials(myReview.Reviewer?.FullName),
                    RevieweeId = myReview.RevieweeId,
                    RevieweeName = partner?.FullName ?? "",
                    RevieweeAvatar = GetInitials(partner?.FullName),
                    RatingValue = myReview.RatingValue,
                    WrittenFeedback = myReview.WrittenFeedback
                },
                ReviewReceived = partnerReview == null ? null : new ReviewItemDto
                {
                    ReviewId = partnerReview.ReviewId,
                    SessionId = partnerReview.SessionId,
                    RequestId = exchange.RequestId,
                    ReviewerId = partnerReview.ReviewerId,
                    ReviewerName = partner?.FullName ?? "Partner",
                    ReviewerAvatar = GetInitials(partner?.FullName),
                    RevieweeId = currentUserId,
                    RatingValue = partnerReview.RatingValue,
                    WrittenFeedback = partnerReview.WrittenFeedback
                }
            }
        });
    }

    /// <summary>
    /// Gets public reviews received by a user.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("reviews/user/{userId}")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { success = false, message = "User not found." });

        var reviews = await _dbContext.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Session)
            .Where(r => r.RevieweeId == userId)
            .OrderByDescending(r => r.ReviewId)
            .Select(r => new ReviewItemDto
            {
                ReviewId = r.ReviewId,
                SessionId = r.SessionId,
                RequestId = r.Session.RequestId,
                ReviewerId = r.ReviewerId,
                ReviewerName = r.Reviewer.FullName,
                ReviewerAvatar = GetInitials(r.Reviewer.FullName),
                RevieweeId = r.RevieweeId,
                RevieweeName = user.FullName,
                RevieweeAvatar = GetInitials(user.FullName),
                RatingValue = r.RatingValue,
                WrittenFeedback = r.WrittenFeedback
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                userId = user.UserId,
                fullName = user.FullName,
                trustRating = user.TrustRating,
                totalReviews = reviews.Count,
                reviews
            }
        });
    }

    private static string GetInitials(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "U";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
