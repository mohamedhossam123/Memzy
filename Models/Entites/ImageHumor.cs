namespace Memzy_finalist.Models
{
    public class ImageHumor
    {
        public int ImageHumorId { get; set; }
        public int ImageId { get; set; }
        public int HumorTypeId { get; set; }

        public virtual Image Image { get; set; }
        public virtual HumorType HumorType { get; set; }
    }
}