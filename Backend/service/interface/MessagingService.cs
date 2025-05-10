using Memzy_finalist.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public interface IMessagingService
{
    Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent);
    Task<List<Message>> GetMessagesAsync(int userId, int contactId);
    Task<bool> DeleteMessageAsync(int messageId);
    Task<Message> GetMessageByIdAsync(int messageId);
}


public class MessagingService : IMessagingService
{
    private readonly MemzyContext _context;
    private readonly ILogger<MessagingService> _logger;

    public MessagingService(
        MemzyContext context,
        ILogger<MessagingService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent)
    {
        if (string.IsNullOrWhiteSpace(messageContent))
        {
            _logger.LogError("Message content is null or empty");
            throw new ArgumentException("Message content is required", nameof(messageContent));
        }

        // Verify friendship using a consolidated query
        var friendshipExists = await _context.Friendships
            .AnyAsync(f => 
                (f.User1Id == senderId && f.User2Id == receiverId) || 
                (f.User1Id == receiverId && f.User2Id == senderId));

        if (!friendshipExists)
        {
            _logger.LogWarning($"Security: User {senderId} attempted to message non-friend {receiverId}");
            throw new InvalidOperationException("You can only send messages to friends");
        }

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = messageContent.Trim(),
            Timestamp = DateTime.UtcNow
        };

        try
        {
            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
            return message.MessageId;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, $"Failed to save message from {senderId} to {receiverId}");
            throw new ApplicationException("Failed to send message", ex);
        }
    }

    public async Task<List<Message>> GetMessagesAsync(int userId, int contactId)
    {
        return await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) ||
                        (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderBy(m => m.Timestamp)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Message> GetMessageByIdAsync(int messageId)
    {
        return await _context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
    }

    public async Task<bool> DeleteMessageAsync(int messageId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message == null) return false;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, $"Failed to delete message {messageId}");
            throw;
        }
    }
}