using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Extensions;
using SkillSwap.Api.Hubs;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly SkillSwapDbContext _dbContext;
    private readonly IHubContext<ChatHub> _chatHubContext;

    public MessagesController(SkillSwapDbContext dbContext, IHubContext<ChatHub> chatHubContext)
    {
        _dbContext = dbContext;
        _chatHubContext = chatHubContext;
    }

    /// <summary>
    /// Gets all registered database users available for direct skill swapping & messaging,
    /// along with their last message history with the current logged-in user.
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetChatUsers([FromQuery] bool all = false)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _dbContext.Users.FindAsync(currentUserId);
        var isAdmin = currentUser?.IsAdmin ?? false;

        IQueryable<User> query = _dbContext.Users
            .Include(u => u.Skills)
            .Where(u => u.UserId != currentUserId);

        // Privacy enforcement: regular users only see peers they have an exchange request or messages with
        if (!isAdmin && !all)
        {
            var connectedUserIds = await _dbContext.ExchangeRequests
                .Where(er => er.SenderId == currentUserId || er.ReceiverId == currentUserId)
                .Select(er => er.SenderId == currentUserId ? er.ReceiverId : er.SenderId)
                .Distinct()
                .ToListAsync();

            var messagedUserIds = await _dbContext.Messages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .Select(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToListAsync();

            var allowedUserIds = connectedUserIds.Union(messagedUserIds).ToList();
            query = query.Where(u => allowedUserIds.Contains(u.UserId));
        }

        var users = await query.ToListAsync();

        var allUserMessages = await _dbContext.Messages
            .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
            .OrderByDescending(m => m.SentTimestamp)
            .ToListAsync();

        var result = new List<ChatUserDto>();

        foreach (var user in users)
        {
            var lastMsg = allUserMessages.FirstOrDefault(m =>
                (m.SenderId == user.UserId && m.ReceiverId == currentUserId) ||
                (m.SenderId == currentUserId && m.ReceiverId == user.UserId));

            var unreadCount = allUserMessages.Count(m =>
                m.SenderId == user.UserId && m.ReceiverId == currentUserId && !m.IsRead);

            var canTeach = user.Skills
                .Where(s => s.TypeTag == SkillTypeTag.Teach)
                .Select(s => s.SkillName)
                .ToList();

            var wantsToLearn = user.Skills
                .Where(s => s.TypeTag == SkillTypeTag.Learn)
                .Select(s => s.SkillName)
                .ToList();

            result.Add(new ChatUserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                EmailAddress = user.EmailAddress,
                Avatar = GetInitials(user.FullName),
                BioDetails = user.BioDetails,
                TrustRating = user.TrustRating,
                SkillsCanTeach = canTeach,
                SkillsWantsToLearn = wantsToLearn,
                LastMessage = lastMsg?.MessageBody ?? "Ready to swap skills!",
                LastMessageTime = lastMsg?.SentTimestamp,
                UnreadCount = unreadCount,
                IsOnline = true
            });
        }

        // Order by users who have recent messages first
        var ordered = result
            .OrderByDescending(r => r.LastMessageTime.HasValue)
            .ThenByDescending(r => r.LastMessageTime)
            .ThenBy(r => r.FullName)
            .ToList();

        return Ok(new { success = true, data = ordered });
    }

    /// <summary>
    /// Gets the complete message history between the current user and the specified partner from database.
    /// </summary>
    [HttpGet("{partnerId}")]
    public async Task<IActionResult> GetMessagesWithPartner(int partnerId)
    {
        var currentUserId = User.GetUserId();

        var partner = await _dbContext.Users.FindAsync(partnerId);
        if (partner == null)
            return NotFound(new { error = "User not found in database." });

        var messages = await _dbContext.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m =>
                (m.SenderId == currentUserId && m.ReceiverId == partnerId) ||
                (m.SenderId == partnerId && m.ReceiverId == currentUserId))
            .OrderBy(m => m.SentTimestamp)
            .ToListAsync();

        // Mark incoming messages as read
        var unreadIncoming = messages
            .Where(m => m.SenderId == partnerId && m.ReceiverId == currentUserId && !m.IsRead)
            .ToList();

        if (unreadIncoming.Any())
        {
            foreach (var msg in unreadIncoming)
            {
                msg.IsRead = true;
            }
            await _dbContext.SaveChangesAsync();
        }

        var dtoList = messages.Select(m => new MessageResponseDto
        {
            MessageId = m.MessageId,
            SenderId = m.SenderId,
            SenderName = m.Sender.FullName,
            SenderAvatar = GetInitials(m.Sender.FullName),
            ReceiverId = m.ReceiverId,
            ReceiverName = m.Receiver.FullName,
            ReceiverAvatar = GetInitials(m.Receiver.FullName),
            MessageBody = m.MessageBody,
            SentTimestamp = m.SentTimestamp,
            IsRead = m.IsRead,
            IsMe = m.SenderId == currentUserId
        }).ToList();

        return Ok(new { success = true, data = dtoList });
    }

    /// <summary>
    /// Sends a message to a real user in the database and broadcasts via SignalR in real-time.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto request)
    {
        var currentUserId = User.GetUserId();

        if (currentUserId == request.ReceiverId)
            return BadRequest(new { error = "Cannot message yourself." });

        var sender = await _dbContext.Users.FindAsync(currentUserId);
        var receiver = await _dbContext.Users.FindAsync(request.ReceiverId);

        if (sender == null || receiver == null)
            return NotFound(new { error = "Recipient user not found in database." });

        var message = new Message
        {
            SenderId = currentUserId,
            ReceiverId = request.ReceiverId,
            MessageBody = request.MessageBody.Trim(),
            SentTimestamp = DateTime.UtcNow,
            IsRead = false
        };

        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync();

        var messageDto = new MessageResponseDto
        {
            MessageId = message.MessageId,
            SenderId = sender.UserId,
            SenderName = sender.FullName,
            SenderAvatar = GetInitials(sender.FullName),
            ReceiverId = receiver.UserId,
            ReceiverName = receiver.FullName,
            ReceiverAvatar = GetInitials(receiver.FullName),
            MessageBody = message.MessageBody,
            SentTimestamp = message.SentTimestamp,
            IsRead = message.IsRead,
            IsMe = false
        };

        // Real-time broadcast to receiver's group
        await _chatHubContext.Clients.Group(request.ReceiverId.ToString())
            .SendAsync("ReceiveMessage", messageDto);

        var responseDto = new MessageResponseDto
        {
            MessageId = message.MessageId,
            SenderId = sender.UserId,
            SenderName = sender.FullName,
            SenderAvatar = GetInitials(sender.FullName),
            ReceiverId = receiver.UserId,
            ReceiverName = receiver.FullName,
            ReceiverAvatar = GetInitials(receiver.FullName),
            MessageBody = message.MessageBody,
            SentTimestamp = message.SentTimestamp,
            IsRead = message.IsRead,
            IsMe = true
        };

        // Real-time broadcast to sender's group as well
        await _chatHubContext.Clients.Group(currentUserId.ToString())
            .SendAsync("MessageSent", responseDto);

        return Ok(new { success = true, data = responseDto });
    }

    /// <summary>
    /// Marks all unread messages from a partner as read.
    /// </summary>
    [HttpPut("{partnerId}/read")]
    public async Task<IActionResult> MarkMessagesAsRead(int partnerId)
    {
        var currentUserId = User.GetUserId();

        var unread = await _dbContext.Messages
            .Where(m => m.SenderId == partnerId && m.ReceiverId == currentUserId && !m.IsRead)
            .ToListAsync();

        foreach (var msg in unread)
        {
            msg.IsRead = true;
        }

        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, count = unread.Count });
    }

    /// <summary>
    /// Deletes a message by its ID if the logged-in user is the sender or an admin.
    /// Broadcasts the deletion event in real time via SignalR.
    /// </summary>
    [HttpDelete("{messageId:int}")]
    public async Task<IActionResult> DeleteMessage(int messageId)
    {
        var currentUserId = User.GetUserId();
        var message = await _dbContext.Messages.FindAsync(messageId);

        if (message == null)
            return NotFound(new { error = "Message not found in database." });

        var currentUser = await _dbContext.Users.FindAsync(currentUserId);
        var isAdmin = currentUser?.IsAdmin ?? false;

        if (message.SenderId != currentUserId && !isAdmin)
        {
            return Forbid();
        }

        var senderId = message.SenderId;
        var receiverId = message.ReceiverId;

        _dbContext.Messages.Remove(message);
        await _dbContext.SaveChangesAsync();

        // Broadcast real-time deletion event to both participants
        await _chatHubContext.Clients.Group(receiverId.ToString())
            .SendAsync("MessageDeleted", messageId);
        await _chatHubContext.Clients.Group(senderId.ToString())
            .SendAsync("MessageDeleted", messageId);

        return Ok(new { success = true, message = "Message deleted successfully.", messageId });
    }

    /// <summary>
    /// Deletes the entire conversation history between the current user and a partner from database.
    /// Broadcasts the deletion event in real time via SignalR.
    /// </summary>
    [HttpDelete("conversations/{partnerId:int}")]
    public async Task<IActionResult> DeleteConversation(int partnerId)
    {
        var currentUserId = User.GetUserId();

        var messages = await _dbContext.Messages
            .Where(m =>
                (m.SenderId == currentUserId && m.ReceiverId == partnerId) ||
                (m.SenderId == partnerId && m.ReceiverId == currentUserId))
            .ToListAsync();

        if (messages.Any())
        {
            _dbContext.Messages.RemoveRange(messages);
            await _dbContext.SaveChangesAsync();
        }

        // Broadcast real-time conversation deletion event to both participants
        await _chatHubContext.Clients.Group(partnerId.ToString())
            .SendAsync("ConversationDeleted", currentUserId);
        await _chatHubContext.Clients.Group(currentUserId.ToString())
            .SendAsync("ConversationDeleted", partnerId);

        return Ok(new { success = true, message = "Conversation deleted successfully.", partnerId, deletedCount = messages.Count });
    }

    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "U";
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
