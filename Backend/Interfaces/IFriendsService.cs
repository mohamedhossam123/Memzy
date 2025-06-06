using Memzy_finalist.Models;
using Memzy_finalist.Models.DTOs;

public interface IFriendsService
{
    Task<IEnumerable<FriendRequest>> GetAllReceivedRequests(int userId);
    Task<FriendshipStatusDto> GetFriendshipStatus(int userId1, int userId2);
    Task<bool> CancelFriendRequestByReceiver(int senderId, int receiverId);
    Task<IEnumerable<FriendRequest>> GetAllSentRequests(int userId);
    Task<FriendRequest> SendFriendRequest(int senderId, int receiverId);
    Task<Friendship> AcceptFriendRequest(int requestId, int userId);
    Task<FriendRequest> RejectFriendRequest(int requestId, int userId);
    Task<bool> CancelFriendRequest(int requestId, int userId);
    Task<bool> RemoveFriend(int userId, int friendId);
    Task<IEnumerable<FriendDTO2>> GetFriends(int userId);
    Task<List<FriendRequestDTO>> GetPendingFriendRequests(int userId);
    Task<IEnumerable<FriendDTO2>> GetFriendsAnotherUser(int userId);

}