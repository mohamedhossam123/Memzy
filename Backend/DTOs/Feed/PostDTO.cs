using Memzy_finalist.Models;
using System.Collections.Generic;

public class PostDto
{
    public int PostId { get; set; }
    public MediaType MediaType { get; set; }
    public string Description { get; set; }
    public string FilePath { get; set; }
    public DateTime CreatedAt { get; set; }
    public int LikeCounter { get; set; }
    public bool IsApproved { get; set; }
    public List<int> HumorTypeIds { get; set; } = new List<int>();
    public List<HumorTypeDto> HumorTypes { get; set; } = new List<HumorTypeDto>();
    public string UserName { get; set; }
    public bool IsLiked { get; set; } = false;
    public string ProfileImageUrl { get; set; }
    public string Name { get; set; }
}

