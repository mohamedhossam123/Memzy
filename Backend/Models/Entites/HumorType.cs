namespace Memzy_finalist.Models
{
    public partial class HumorType
    {
        public HumorType()
        {
            UserHumorPreferences = new HashSet<UserHumorPreference>();
            ImageHumors = new HashSet<ImageHumor>();
            VideoHumors = new HashSet<VideoHumor>();
        }

        public int HumorTypeId { get; set; }
        public string HumorTypeName { get; set; } = null!;

        public virtual ICollection<UserHumorPreference> UserHumorPreferences { get; set; } = new List<UserHumorPreference>();


        public virtual ICollection<ImageHumor> ImageHumors { get; set; }
        public virtual ICollection<VideoHumor> VideoHumors { get; set; }
    }
}