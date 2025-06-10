public class FriendRequestResponseDto
{
    public int RequestId { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}