using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;

namespace MyApiProject.Services
{

        

public class MessagingService : IMessagingService
{
    private readonly MemzyContext _context;
    private readonly ILogger<MessagingService> _logger;

    public MessagingService(
        MemzyContext context, 
        ILogger<MessagingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<int> SendMessageAsync(int senderId, int receiverId, string content)
    {
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();


        _logger.LogInformation($"Message sent from user {senderId} to user {receiverId}");

        return message.MessageId;
    }

    public async Task<List<Message>> GetMessagesAsync(int userId, int contactId, int page, int pageSize)
    {
        return await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) ||
                       (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderByDescending(m => m.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> DeleteMessageAsync(int messageId, int userId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.SenderId == userId);

        if (message == null) return false;

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();
        return true;
    }
}
}
