using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace Memzy_finalist.Models
{
    public partial class Image
    {
        public int ImageId { get; set; }
        public int UserId { get; set; }
        public string Description { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int ImageLikeCounter { get; set; } = 0;
        public virtual User User { get; set; }
        
        [NotMapped]
        public IFormFile ImageFile { get; set; }
        public virtual ICollection<ImageHumor> ImageHumors { get; set; } = new HashSet<ImageHumor>();
    }
}