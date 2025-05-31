using Memzy_finalist.Models;

public interface IMessagingService
{
    Task<int> SendMessageAsync(int senderId, int receiverId, string content);
    Task<List<MessageResponseDto>> GetMessagesAsync(int userId, int contactId, int page, int pageSize);

    Task<bool> DeleteMessageAsync(int messageId, int userId);
    Task<int> SendMessageWithValidationAsync(int senderId, MessageDto request);
}