public class CreateGroupDTO
{
    public string GroupName { get; set; } = string.Empty;
    public int OwnerId { get; set; } 
    public List<int> MemberIds { get; set; } = new List<int>(); 
}