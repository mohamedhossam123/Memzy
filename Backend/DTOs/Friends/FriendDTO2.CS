namespace Memzy_finalist.Models.DTOs
{
    public class FriendDTO2
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string Bio { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastActive { get; set; }
    }
}