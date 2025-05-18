using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;

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
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent)
        {
            if (senderId == receiverId)
                throw new ArgumentException("Cannot send messages to yourself");
            if (string.IsNullOrWhiteSpace(messageContent))
            {
                _logger.LogError("Message content is null or empty");
                throw new ArgumentException("Message content is required", nameof(messageContent));
            }

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

        public async Task<List<MessageResponseDto>> GetMessagesAsync(
            int userId, int contactId, int page = 1, int pageSize = 50)
        {
            var areFriends = await _context.Friendships
                .AnyAsync(f =>
                    (f.User1Id == userId && f.User2Id == contactId) ||
                    (f.User1Id == contactId && f.User2Id == userId));
            if (!areFriends)
                throw new InvalidOperationException("You can only view messages with friends");

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
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.MessageId == messageId &&
                                     (m.SenderId == userId || m.ReceiverId == userId));

            if (message == null) return false;
            _context.Messages.Remove(message); 
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
