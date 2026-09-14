using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Data;
using SkillSwap.Api.DTOs;
using SkillSwap.Api.Extensions;
using SkillSwap.Api.Models;

namespace SkillSwap.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly SkillSwapDbContext _dbContext;

    public ChatHub(SkillSwapDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.User?.GetUserId();
            if (userId.HasValue)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }
        }
        catch
        {
            // Ignored if user not authenticated
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = Context.User?.GetUserId();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }
        }
        catch
        {
            // Ignored
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(int receiverId, string messageText)
    {
        var senderId = Context.User!.GetUserId();

        if (string.IsNullOrWhiteSpace(messageText))
            return;

        var sender = await _dbContext.Users.FindAsync(senderId);
        var receiver = await _dbContext.Users.FindAsync(receiverId);

        if (sender == null || receiver == null)
            return;

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            MessageBody = messageText.Trim(),
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

        // Send to receiver in real-time
        await Clients.Group(receiverId.ToString()).SendAsync("ReceiveMessage", messageDto);

        // Acknowledge back to sender
        var senderDto = new MessageResponseDto
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

        await Clients.Group(senderId.ToString()).SendAsync("MessageSent", senderDto);
    }

    public async Task SendTyping(int receiverId)
    {
        var senderId = Context.User!.GetUserId();
        await Clients.Group(receiverId.ToString()).SendAsync("UserTyping", senderId);
    }

    public async Task DeleteMessage(int messageId)
    {
        var currentUserId = Context.User!.GetUserId();
        var message = await _dbContext.Messages.FindAsync(messageId);
        if (message == null) return;

        var currentUser = await _dbContext.Users.FindAsync(currentUserId);
        var isAdmin = currentUser?.IsAdmin ?? false;

        if (message.SenderId != currentUserId && !isAdmin) return;

        var receiverId = message.ReceiverId;
        var senderId = message.SenderId;

        _dbContext.Messages.Remove(message);
        await _dbContext.SaveChangesAsync();

        await Clients.Group(receiverId.ToString()).SendAsync("MessageDeleted", messageId);
        await Clients.Group(senderId.ToString()).SendAsync("MessageDeleted", messageId);
    }

    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "U";
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
