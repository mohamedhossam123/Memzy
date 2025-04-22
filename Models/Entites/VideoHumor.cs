namespace Memzy_finalist.Models
{
    public class VideoHumor
    {
        public int VideoHumorId { get; set; }
        public int VideoId { get; set; }
        public int HumorTypeId { get; set; }

        public virtual Video Video { get; set; }
        public virtual HumorType HumorType { get; set; }
    }
}