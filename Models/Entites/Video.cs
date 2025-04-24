using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace Memzy_finalist.Models
{
    public partial class Video
    {
        public int VideoId { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int VideoLikeCounter { get; set; } = 0;
        public bool IsApproved { get; set; } = false;
        public virtual User User { get; set; }
        
        [NotMapped]
        public IFormFile VideoFile { get; set; }
        public virtual ICollection<VideoHumor> VideoHumors { get; set; } = new HashSet<VideoHumor>();
    }
}