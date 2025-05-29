
public class FriendRequestDTO
{
    public int RequestId { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderProfileImageUrl { get; set; } = string.Empty;
    public int ReceiverId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}