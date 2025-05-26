public class GetUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public int FriendsCount { get; set; }
    public int PostsCount { get; set; }
}