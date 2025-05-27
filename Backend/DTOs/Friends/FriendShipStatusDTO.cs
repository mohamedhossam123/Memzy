public class FriendshipStatusDto
{
    public bool IsFriend { get; set; }
    public bool HasPendingRequest { get; set; }
    public string RequestType { get; set; }
    public int? RequestId { get; set; }
}