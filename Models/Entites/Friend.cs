using System;

namespace Memzy_finalist.Models
{
    public partial class Friend
    {
        public int FriendshipId { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public bool CanMessage { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User1 { get; set; }
        public virtual User User2 { get; set; }
    }
}