using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;

namespace MyApiProject.Services
{
    public class MessagingService : IMessagingService
    {
        private readonly MemzyContext _context;
        private readonly ILogger<MessagingService> _logger;
        private readonly IFriendsService _friendsService;

        public MessagingService(
            MemzyContext context, 
            ILogger<MessagingService> logger,
            IFriendsService friendsService)
        {
            _context = context;
            _logger = logger;
            _friendsService = friendsService;
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
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.MessageId == messageId && m.SenderId == userId);
            if (message == null) return false;
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> SendMessageWithValidationAsync(int senderId, MessageDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Content) || request.ReceiverId <= 0)
            {
                throw new ArgumentException("Invalid message data");
            }

            if (senderId <= 0)
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var friendshipStatus = await _friendsService.GetFriendshipStatus(senderId, request.ReceiverId);
            if (!friendshipStatus.IsFriend && !friendshipStatus.HasPendingRequest)
            {
                throw new ArgumentException("You can only send messages to friends or pending requests");
            }

            var messageId = await SendMessageAsync(senderId, request.ReceiverId, request.Content);
            return messageId;
        }
    }
}