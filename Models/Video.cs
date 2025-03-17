using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class Video
    {
        public int VideoId { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual User User { get; set; }
    }
}
