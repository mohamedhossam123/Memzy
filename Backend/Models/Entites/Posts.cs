using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace Memzy_finalist.Models
{
    public enum MediaType
    {
        Image,
        Video
    }

    public partial class Post
    {
        public Post()
        {
            PostHumors = new HashSet<PostHumor>();
        }

        public int PostId { get; set; }
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public MediaType MediaType { get; set; }
        public string Description { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int LikeCounter { get; set; } = 0;
        public bool IsApproved { get; set; } = false;

        [NotMapped]
        public IFormFile File { get; set; }

        public virtual User User { get; set; }
        public virtual ICollection<PostHumor> PostHumors { get; set; }
    }

    public partial class PostHumor
    {
        public int PostHumorId { get; set; }
        public int PostId { get; set; }
        public int HumorTypeId { get; set; }

        public virtual Post Post { get; set; }
        public virtual HumorType HumorType { get; set; }
    }
}
