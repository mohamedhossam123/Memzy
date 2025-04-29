using System.ComponentModel.DataAnnotations;

namespace Memzy_finalist.Models
{
    public partial class User
    {
        public User()
        {
            FriendRequestsSent = new HashSet<FriendRequest>();
            FriendRequestsReceived = new HashSet<FriendRequest>();
            FriendsAsUser1 = new HashSet<Friend>();
            FriendsAsUser2 = new HashSet<Friend>();
            Images = new HashSet<Image>();
            MessagesSent = new HashSet<Message>();
            MessagesReceived = new HashSet<Message>();
            UserHumorPreferences = new HashSet<UserHumorPreference>();
            Videos = new HashSet<Video>();
        }

        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? ProfilePictureUrl { get; set; }
        public string? Bio { get; set; }
        public string PasswordHash { get; set; } = null!;
        public string Status { get; set; } = "normal";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<FriendRequest> FriendRequestsSent { get; set; }
        public virtual ICollection<FriendRequest> FriendRequestsReceived { get; set; }
        public virtual ICollection<Friend> FriendsAsUser1 { get; set; }
        public virtual ICollection<Friend> FriendsAsUser2 { get; set; }
        public virtual ICollection<Image> Images { get; set; }
        public virtual ICollection<Message> MessagesSent { get; set; }
        public virtual ICollection<Message> MessagesReceived { get; set; }
        public virtual ICollection<UserHumorPreference> UserHumorPreferences { get; set; }
        public virtual ICollection<Video> Videos { get; set; }
    }
}