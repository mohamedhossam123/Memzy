using System;
using System.Collections;

namespace Memzy_finalist.Models
{
    public partial class Message
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string MessageText { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public virtual User Receiver { get; set; }
        public virtual User Sender { get; set; }
    }
}