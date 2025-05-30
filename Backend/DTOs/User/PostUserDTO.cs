public class PostUserDto
{
    public int PostId { get; set; }
    public string Description { get; set; }
    public string FilePath { get; set; }
    public string ContentType { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> HumorTypes { get; set; }
}