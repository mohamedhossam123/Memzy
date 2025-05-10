namespace Memzy_finalist.Models
{
    public class UserHumorType
    {
        public int UserId { get; set; }
        public virtual User User { get; set; }

        public int HumorTypeId { get; set; }
        public virtual HumorType HumorType { get; set; }
    }
}
