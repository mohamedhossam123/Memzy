using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;

namespace MyApiProject.Services
{

        public class MessagingService : IMessagingService
{
    private readonly MemzyContext _context;
    private readonly ILogger<MessagingService> _logger;
    private readonly WebSocketConnectionManager _webSocketManager;

    public MessagingService(MemzyContext context, ILogger<MessagingService> logger, WebSocketConnectionManager webSocketManager)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _webSocketManager = webSocketManager ?? throw new ArgumentNullException(nameof(webSocketManager));
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

        var response = new MessageResponseDto
        {
            MessageId = message.MessageId,
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Timestamp = message.Timestamp
        };

        await SendMessageToWebSocketAsync(receiverId, response);

        return  message.MessageId;
    }

    public async Task<List<MessageResponseDto>> GetMessagesAsync(int userId, int contactId, int page, int pageSize)
    {
        return await _context.Messages
            .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) ||
                        (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderByDescending(m => m.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageResponseDto
            {
                MessageId = m.MessageId,
                Content = m.Content,
                Timestamp = m.Timestamp,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId
            })
            .ToListAsync();
    }

    public async Task<bool> DeleteMessageAsync(int messageId, int userId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message == null || message.SenderId != userId)
            return false;

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SendMessageToWebSocketAsync(int receiverId, MessageResponseDto message)
    {
        var socket = _webSocketManager.Get(receiverId);
        if (socket != null && socket.State == WebSocketState.Open)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(message);
            var bytes = System.Text.Encoding.UTF8.GetBytes(json);
            var buffer = new ArraySegment<byte>(bytes);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}

    }
