using Memzy_finalist.Models;

public partial class HumorType
{
    public HumorType()
    {
        ImageHumors = new HashSet<ImageHumor>();
        VideoHumors = new HashSet<VideoHumor>();
        UserHumorTypes = new HashSet<UserHumorType>(); 
    }

    public int HumorTypeId { get; set; }
    public string HumorTypeName { get; set; } = null!;

    public virtual ICollection<ImageHumor> ImageHumors { get; set; }
    public virtual ICollection<VideoHumor> VideoHumors { get; set; }
    public virtual ICollection<UserHumorType> UserHumorTypes { get; set; } 
}
