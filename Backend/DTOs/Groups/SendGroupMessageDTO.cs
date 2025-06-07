public class SendGroupMessageDTO
{
    public int GroupId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty; 
}