using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class FriendRequest
    {
        public int RequestId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual User Receiver { get; set; }
        public virtual User Sender { get; set; }
    }
}
