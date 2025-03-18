using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class User
    {
        public User()
        {
            FriendRequestReceivers = new HashSet<FriendRequest>();
            FriendRequestSenders = new HashSet<FriendRequest>();
            FriendUser1s = new HashSet<Friend>();
            FriendUser2s = new HashSet<Friend>();
            Images = new HashSet<Image>();
            MessageReceivers = new HashSet<Message>();
            MessageSenders = new HashSet<Message>();
            UserHumors = new HashSet<UserHumor>();
            Videos = new HashSet<Video>();
        }

        public int UserId { get; set; }
        public string Email { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string Bio { get; set; }
        public string PasswordHash { get; set; }
        public string status {get;set;} ="normal";
        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<FriendRequest> FriendRequestReceivers { get; set; }
        public virtual ICollection<FriendRequest> FriendRequestSenders { get; set; }
        public virtual ICollection<Friend> FriendUser1s { get; set; }
        public virtual ICollection<Friend> FriendUser2s { get; set; }
        public virtual ICollection<Image> Images { get; set; }
        public virtual ICollection<Message> MessageReceivers { get; set; }
        public virtual ICollection<Message> MessageSenders { get; set; }
        public virtual ICollection<UserHumor> UserHumors { get; set; }
        public virtual ICollection<Video> Videos { get; set; }
    }
}
