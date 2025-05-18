using Memzy_finalist.Models;

public interface IFriendsService
{
    Task<IEnumerable<FriendRequest>> GetAllReceivedRequests(int userId);
Task<IEnumerable<FriendRequest>> GetAllSentRequests(int userId);
    Task<FriendRequest> SendFriendRequest(int senderId, int receiverId);
    Task<Friendship> AcceptFriendRequest(int requestId, int userId);
    Task<FriendRequest> RejectFriendRequest(int requestId, int userId);
    Task<bool> CancelFriendRequest(int requestId, int userId);
    Task<bool> RemoveFriend(int userId, int friendId);
Task<IEnumerable<User>> GetFriends(int userId);
    Task<IEnumerable<FriendRequest>> GetPendingFriendRequests(int userId);
}