using Memzy_finalist.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Models
{
    public class FriendsService: IFriendsService
    {
        private readonly MemzyContext _context;

        public FriendsService(MemzyContext context)
        {
            _context = context;
        }

        public async Task<FriendRequest> SendFriendRequest(int senderId, int receiverId)
        {
            try
            {
                if (senderId == receiverId)
                    throw new ArgumentException("Cannot send request to yourself");
                var existingFriendship = await _context.Friendships
                    .AnyAsync(f =>
                        (f.User1Id == senderId && f.User2Id == receiverId) ||
                        (f.User1Id == receiverId && f.User2Id == senderId));

                if (existingFriendship)
                    throw new InvalidOperationException("Users are already friends");
                var existingRequest = await _context.FriendRequests
                    .AnyAsync(fr =>
                        (fr.SenderId == senderId && fr.ReceiverId == receiverId) ||
                        (fr.SenderId == receiverId && fr.ReceiverId == senderId));

                if (existingRequest)
                    throw new InvalidOperationException("Pending request already exists between these users");

                var sender = await _context.Users.FindAsync(senderId);
                var receiver = await _context.Users.FindAsync(receiverId);

                if (sender == null || receiver == null)
                    throw new ArgumentException("One or both users not found");

                var request = new FriendRequest
                {
                    SenderId = senderId,
                    ReceiverId = receiverId,
                    Status = FriendRequestStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.FriendRequests.Add(request);
                await _context.SaveChangesAsync();

                return request;
            }
            catch (Exception)
            {
                throw;
            }
        }
        
        public async Task<FriendshipStatusDto> GetFriendshipStatus(int userId1, int userId2)
        {
            if (userId1 == userId2)
                return new FriendshipStatusDto { IsFriend = false, HasPendingRequest = false };

            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.User1Id == userId1 && f.User2Id == userId2) ||
                    (f.User1Id == userId2 && f.User2Id == userId1));

            if (friendship != null)
                return new FriendshipStatusDto { IsFriend = true, HasPendingRequest = false };
            var sentRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(fr =>
                    fr.SenderId == userId1 && fr.ReceiverId == userId2 &&
                    fr.Status == FriendRequestStatus.Pending);

            if (sentRequest != null)
                return new FriendshipStatusDto { 
                    IsFriend = false, 
                    HasPendingRequest = true,
                    RequestType = "sent", 
                    RequestId = sentRequest.RequestId
                };
            var receivedRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(fr =>
                    fr.SenderId == userId2 && fr.ReceiverId == userId1 &&
                    fr.Status == FriendRequestStatus.Pending);

            if (receivedRequest != null)
                return new FriendshipStatusDto { 
                    IsFriend = false, 
                    HasPendingRequest = true,
                    RequestType = "received", 
                    RequestId = receivedRequest.RequestId
                };

            return new FriendshipStatusDto { IsFriend = false, HasPendingRequest = false };
        }

        public async Task<Friendship> AcceptFriendRequest(int requestId, int userId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => fr.RequestId == requestId && fr.ReceiverId == userId);

            if (request == null)
                throw new ArgumentException("Friend request not found or unauthorized");

            if (request.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException($"Request is already {request.Status}");
            request.Status = FriendRequestStatus.Accepted;
            request.RespondedAt = DateTime.UtcNow;
            var friendship = new Friendship
            {
                User1Id = request.SenderId,
                User2Id = request.ReceiverId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Friendships.Add(friendship);

            _context.FriendRequests.Remove(request);
            await _context.SaveChangesAsync();

            return friendship;
        }
        
        public async Task<FriendRequest> RejectFriendRequest(int requestId, int userId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => fr.RequestId == requestId && fr.ReceiverId == userId);
                
            if (request == null)
                throw new ArgumentException("Friend request not found or unauthorized");
                
            if (request.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException($"Request is already {request.Status}");

            request.Status = FriendRequestStatus.Rejected;
            request.RespondedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return request;
        }
        public async Task<bool> CancelFriendRequest(int requestId, int userId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => fr.RequestId == requestId && fr.SenderId == userId);

            if (request == null)
                throw new ArgumentException("Friend request not found or you're not authorized to cancel it");

            if (request.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException($"Friend request is already {request.Status}");
                
            _context.FriendRequests.Remove(request);
            await _context.SaveChangesAsync();
            
            return true;
        }
        public async Task<bool> CancelFriendRequestByReceiver(int senderId, int receiverId)
        {
            var request = await _context.FriendRequests
                .FirstOrDefaultAsync(fr => 
                    fr.SenderId == senderId && 
                    fr.ReceiverId == receiverId && 
                    fr.Status == FriendRequestStatus.Pending);

            if (request == null)
                throw new ArgumentException("No pending friend request found between these users");

            _context.FriendRequests.Remove(request);
            await _context.SaveChangesAsync();
            
            return true;
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

        public async Task<IEnumerable<FriendDTO2>> GetFriends(int userId)
        {
            return await _context.Friendships
                .Where(f => f.User1Id == userId || f.User2Id == userId)
                .Include(f => f.User1)
                .Include(f => f.User2)
                .Select(f => f.User1Id == userId ? f.User2 : f.User1)
                .Select(u => new FriendDTO2
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    UserName = u.UserName,
                    ProfilePictureUrl = u.ProfilePictureUrl,
                    Bio = u.Bio,
                    IsOnline = u.IsOnline,
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<FriendDTO2>> GetFriendsAnotherUser(int userId)
    {
        return await _context.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId)
            .Include(f => f.User1)
            .Include(f => f.User2) 
            .Select(f => f.User1Id == userId ? f.User2 : f.User1) 
            .Select(u => new FriendDTO2 
            {
                UserId = u.UserId, 
                Name = u.Name,
                UserName = u.UserName,
                ProfilePictureUrl = u.ProfilePictureUrl,
                Bio = u.Bio,
                IsOnline = u.IsOnline,
                LastActive = u.LastActive
            })
            .ToListAsync();
    }
        public async Task<List<FriendRequestDTO>> GetPendingFriendRequests(int userId)
        {
            return await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending)
                .Include(fr => fr.Sender)
                .Select(fr => new FriendRequestDTO
                {
                    RequestId = fr.RequestId,
                    SenderId = fr.SenderId,
                    SenderName = fr.Sender.Name,
                    SenderUserName = fr.Sender.UserName,
                    SenderProfileImageUrl = fr.Sender.ProfilePictureUrl ?? "",
                    ReceiverId = fr.ReceiverId,
                    Status = fr.Status,
                    CreatedAt = fr.CreatedAt,
                    RespondedAt = fr.RespondedAt,
                    Message = fr.Message

                })
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetAllReceivedRequests(int userId)
        {
            return await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId)
                .Include(fr => fr.Sender)
                .OrderByDescending(fr => fr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<FriendRequest>> GetAllSentRequests(int userId)
        {
            return await _context.FriendRequests
                .Where(fr => fr.SenderId == userId)
                .Include(fr => fr.Receiver)
                .OrderByDescending(fr => fr.CreatedAt)
                .ToListAsync();
        }
    }
}