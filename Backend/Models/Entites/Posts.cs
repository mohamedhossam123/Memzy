using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace Memzy_finalist.Models
{
    public enum MediaType
    {
        Image,
        Video
    }

    public class Post
    {
        public Post()
        {
            PostHumors = new List<PostHumor>();
        }

        [Key]
        public int PostId { get; set; }

        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        [Required]
        public MediaType MediaType { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required, StringLength(255)]
        public string FileName { get; set; }

        [Required, StringLength(512)]
        public string FilePath { get; set; }

        [Required, StringLength(100)]
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

    public class PostHumor
    {
        [Key]
        public int PostHumorId { get; set; }

        [ForeignKey(nameof(Post))]
        public int PostId { get; set; }

        [ForeignKey(nameof(HumorType))]
        public int HumorTypeId { get; set; }

        // Navigation properties
        public virtual Post Post { get; set; }
        public virtual HumorType HumorType { get; set; }
    }
}