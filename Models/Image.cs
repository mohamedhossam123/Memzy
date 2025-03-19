using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class Image
    {
        public int ImageId { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual User User { get; set; }
        public  int image_like_counter {get; set;}
    }
}
