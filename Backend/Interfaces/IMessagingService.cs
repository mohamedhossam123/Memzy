
public interface IMessagingService
    {
        Task<int> SendMessageAsync(int senderId, int receiverId, string messageContent);
        Task<List<MessageResponseDto>> GetMessagesAsync(int userId, int contactId, int page, int pageSize);
        Task<bool> DeleteMessageAsync(int messageId, int userId);
    }