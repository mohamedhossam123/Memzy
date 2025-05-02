using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Memzy_finalist.Models
{
    public partial class User
    {
        public User()
        {
            FriendRequestsSent = new HashSet<FriendRequest>();
            FriendRequestsReceived = new HashSet<FriendRequest>();
            FriendsAsUser1 = new HashSet<Friendship>();
            FriendsAsUser2 = new HashSet<Friendship>();
            Images = new HashSet<Image>();
            MessagesSent = new HashSet<Message>();
            MessagesReceived = new HashSet<Message>();
            Videos = new HashSet<Video>();
        }

        [Key]
        public int UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;
        
        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = null!;
        
        [MaxLength(500)]
        public string ProfilePictureUrl { get; set; }
        
        [MaxLength(500)]
        public string Bio { get; set; }
        
        [Required]
        public string PasswordHash { get; set; } = null!;
        
        [MaxLength(20)]
        public string Status { get; set; } = "normal";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastActive { get; set; }
        public bool IsOnline { get; set; } = false;
        public int? HumorTypeId { get; set; }
        
        public virtual HumorType HumorType { get; set; }
        public virtual ICollection<FriendRequest> FriendRequestsSent { get; set; }
        public virtual ICollection<FriendRequest> FriendRequestsReceived { get; set; }
        public virtual ICollection<Friendship> FriendsAsUser1 { get; set; }
        public virtual ICollection<Friendship> FriendsAsUser2 { get; set; }
        public virtual ICollection<Image> Images { get; set; }
        public virtual ICollection<Message> MessagesSent { get; set; }
        public virtual ICollection<Message> MessagesReceived { get; set; }
        public virtual ICollection<Video> Videos { get; set; }

        [NotMapped]
        public IEnumerable<User> Friends 
        { 
            get
            {
                var friends1 = FriendsAsUser1.Select(f => f.User2);
                var friends2 = FriendsAsUser2.Select(f => f.User1);
                return friends1.Concat(friends2);
            }
        }

        [NotMapped]
        public bool IsActive => LastActive.HasValue && (DateTime.UtcNow - LastActive.Value).TotalMinutes < 10;

        public async Task<bool> IsFriendWith(int userId)
        {
await Task.Delay(0);
            return Friends.Any(f => f.UserId == userId);
        }

        public async Task<bool> HasPendingFriendRequestFrom(int userId)
        {
            await Task.Delay(0);
            return FriendRequestsReceived.Any(fr => fr.SenderId == userId && fr.Status == FriendRequestStatus.Pending);
        }

        public async Task<bool> HasPendingFriendRequestTo(int userId)
        {
            await Task.Delay(0); // Simulate async operation
            return FriendRequestsSent.Any(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending);
        }
    }
}