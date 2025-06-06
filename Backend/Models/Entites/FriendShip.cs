﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Memzy_finalist.Models
{
    public partial class Friendship
    {
        [Key]
        public int FriendshipId { get; set; }

        [ForeignKey("User1")]
        public int User1Id { get; set; }

        [ForeignKey("User2")]
        public int User2Id { get; set; }
        public bool Favorite { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual User User1 { get; set; } = null!;
        public virtual User User2 { get; set; } = null!;
    }
}