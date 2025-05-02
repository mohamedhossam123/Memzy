using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Models
{
    public interface IFriendsService
    {
        Task<FriendRequest> SendFriendRequest(FriendRequest senderId, int receiverId);/**---------**/
        Task<Friendship> AcceptFriendRequest(FriendRequest requestId, int userId);/**---------**/
        Task<FriendRequest> RejectFriendRequest(FriendRequest requestId, int userId);/**---------**/
        Task<FriendRequest> CancelFriendRequest(FriendRequest requestId, int userId);/**---------**/
        Task<bool> RemoveFriend(int userId, int friendId);/**---------**/
        Task<IEnumerable<User>> GetFriends(int userId, bool includeOnlineOnly = false);/**---------**/
        Task<IEnumerable<FriendRequest>> GetPendingFriendRequests(int userId);
        Task<IEnumerable<FriendRequest>> GetSentFriendRequests(int userId);/**---------**/
        Task<bool> ToggleCanMessage(int userId, int friendId);
    }
    public class FriendsService: IFriendsService
    {
        private readonly MemzyContext _context;

        public FriendsService(MemzyContext context)
        {
            _context = context;
        }

        public async Task<FriendRequest> SendFriendRequest(FriendRequest friendRequest, int userId)
        {
            var sender = await _context.Users.FindAsync(userId);
            var receiver = await _context.Users.FindAsync(friendRequest.ReceiverId);    
            if (sender == null || receiver == null)
                throw new ArgumentException("One or both users not found");
            if (await sender.IsFriendWith(receiver.UserId))
                throw new InvalidOperationException("Users are already friends");
            var existingRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => 
                    fr.SenderId == userId && 
                    fr.ReceiverId == friendRequest.ReceiverId && 
                    fr.Status == FriendRequestStatus.Pending);
                    
            if (existingRequest != null)
                throw new InvalidOperationException("Friend request already sent");
            var request = new FriendRequest
            {
                SenderId = userId,
                ReceiverId = friendRequest.ReceiverId,
                Status = FriendRequestStatus.Pending,
                Message = friendRequest.Message,
                CreatedAt = DateTime.UtcNow
            };
            _context.FriendRequests.Add(request);
            await _context.SaveChangesAsync();
            
            return request;
        }
        public async Task<Friendship> AcceptFriendRequest(FriendRequest friendRequest, int userId)
{
    var request = await _context.FriendRequests
        .FirstOrDefaultAsync(fr => fr.RequestId == friendRequest.RequestId && fr.ReceiverId == userId);
        
    if (request == null)
        throw new ArgumentException("Friend request not found or you're not authorized to accept it");
        
    if (request.Status != FriendRequestStatus.Pending)
        throw new InvalidOperationException($"Friend request is already {request.Status}");

    request.Status = FriendRequestStatus.Accepted;
    request.RespondedAt = DateTime.UtcNow;
    
    var friendship = new Friendship
    {
        User1Id = request.SenderId,
        User2Id = request.ReceiverId,
        CanMessage = true, 
        CreatedAt = DateTime.UtcNow,
        LastInteractionAt = DateTime.UtcNow 
    };
    
    _context.Friendships.Add(friendship);
    await _context.SaveChangesAsync();
    
    return friendship;
}
        public async Task<FriendRequest> RejectFriendRequest(FriendRequest friendRequest, int userId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => fr.RequestId == friendRequest.RequestId && fr.ReceiverId == userId);
                
            if (request == null)
                throw new ArgumentException("Friend request not found or you're not authorized to reject it");
                
            if (request.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException($"Friend request is already {request.Status}");

            request.Status = FriendRequestStatus.Rejected;
            request.RespondedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return request;
        }
        public async Task<FriendRequest> CancelFriendRequest(FriendRequest friendRequest, int userId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => fr.RequestId == friendRequest.RequestId && fr.SenderId == userId);
                
            if (request == null)
                throw new ArgumentException("Friend request not found or you're not authorized to cancel it");
                
            if (request.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException($"Friend request is already {request.Status}");

            request.Status = FriendRequestStatus.Canceled;
            request.RespondedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return request;
        }
        public async Task<FriendRequest> SendFriendRequest(int senderId, int receiverId, string message = "")
        {
            var sender = await _context.Users.FindAsync(senderId);
        var receiver = await _context.Users.FindAsync(receiverId);    
            if (sender == null || receiver == null)
                throw new ArgumentException("One or both users not found");
            if (await sender.IsFriendWith(receiverId))
                throw new InvalidOperationException("Users are already friends");
            var existingRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => 
                    fr.SenderId == senderId && 
                    fr.ReceiverId == receiverId && 
                    fr.Status == FriendRequestStatus.Pending);
                    
            if (existingRequest != null)
                throw new InvalidOperationException("Friend request already sent");
            var request = new FriendRequest
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = FriendRequestStatus.Pending,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };
            _context.FriendRequests.Add(request);
            await _context.SaveChangesAsync();
            
            return request;
        }

        public async Task<bool> RemoveFriend(int userId, int friendId)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => 
                    (f.User1Id == userId && f.User2Id == friendId) || 
                    (f.User1Id == friendId && f.User2Id == userId));
                    
            if (friendship == null)
                throw new ArgumentException("Friendship not found");

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            
            return true;
        }
        public async Task<IEnumerable<User>> GetFriends(int userId, bool includeOnlineOnly = false)
        {
            var user = await _context.Users
                .Include(u => u.FriendsAsUser1)
                .ThenInclude(f => f.User2)
                .Include(u => u.FriendsAsUser2)
                .ThenInclude(f => f.User1)
                .FirstOrDefaultAsync(u => u.UserId == userId);
                
            if (user == null)
                throw new ArgumentException("User not found");

            var friends = user.Friends;
            
            if (includeOnlineOnly)
                friends = friends.Where(f => f.IsOnline);
                
            return friends;
        }
        public async Task<IEnumerable<FriendRequest>> GetPendingFriendRequests(int userId)
        {
            return await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending)
                .Include(fr => fr.Sender)
                .OrderByDescending(fr => fr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetSentFriendRequests(int userId)
        {
            return await _context.FriendRequests
                .Where(fr => fr.SenderId == userId && fr.Status == FriendRequestStatus.Pending)
                .Include(fr => fr.Receiver)
                .OrderByDescending(fr => fr.CreatedAt)
                .ToListAsync();
        }



        public async Task<bool> ToggleCanMessage(int userId, int friendId)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => 
                    (f.User1Id == userId && f.User2Id == friendId) || 
                    (f.User1Id == friendId && f.User2Id == userId));
                    
            if (friendship == null)
                throw new ArgumentException("Friendship not found");

            friendship.CanMessage = !friendship.CanMessage;
            await _context.SaveChangesAsync();
            
            return friendship.CanMessage;
        }
    }
}