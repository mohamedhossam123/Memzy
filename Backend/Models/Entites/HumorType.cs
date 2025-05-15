using Memzy_finalist.Models;

public partial class HumorType
{
    public HumorType()
    {
        PostHumors = new HashSet<PostHumor>();
        UserHumorTypes = new HashSet<UserHumorType>();
    }

    public int HumorTypeId { get; set; }
    public string HumorTypeName { get; set; } = null!;

    public virtual ICollection<PostHumor> PostHumors { get; set; }
    public virtual ICollection<UserHumorType> UserHumorTypes { get; set; }
}
