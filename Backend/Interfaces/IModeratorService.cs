using Memzy_finalist.Models;
public interface IModeratorService
{
    Task DeleteUserAsync(int id);
    Task<List<Post>> GetPendingPostsAsync();
    Task<bool> ApprovePostAsync(int postId, int modId);
    Task<bool> RejectPostAsync(int postId, int modId);
    Task<bool> DeletePostAsync(int postId, int modId);
    
}