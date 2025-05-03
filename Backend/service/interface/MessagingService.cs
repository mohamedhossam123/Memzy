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

public interface ImessagingService
{
    Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent);
    Task<List<Message>> GetMessagesAsync(int userId, int contactId);
    Task<bool> DeleteMessageAsync(int messageId);

}
public class MessagingService : ImessagingService
{
    private readonly MemzyContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MessagingService> _logger;

    public MessagingService(
        MemzyContext context, 
        IWebHostEnvironment environment, 
        ILogger<MessagingService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    public async Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent)
    {
        await Task.Delay(0);
        if (string.IsNullOrWhiteSpace(messageContent))
        {
            _logger.LogError("Message content is null or empty");
            throw new ArgumentException("Message content is required", nameof(messageContent));
        }

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = messageContent,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        _context.SaveChanges();

        return message.MessageId;
    
    }
    public async Task<List<Message>> GetMessagesAsync(int userId, int contactId)
    {
        var messages = await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) ||
                        (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return messages;
    }
    public async Task<bool> DeleteMessageAsync(int messageId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message == null)
        {
            return false;
        }

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();
        return true;
    }

}