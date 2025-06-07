public class GroupMessageReturnDTO
{
    public long Id { get; set; } 
    public int GroupId { get; set; }
    public int SenderId { get; set; }
    public string ProfilepictureUrl { get; set; }
    public string senderName { get; set; }
    public string SenderUserName { get; set; } = string.Empty; 
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}