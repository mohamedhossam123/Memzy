using Memzy_finalist.Models;
public interface ICreatingPostsService
{
    Task<FileUploadResult> SaveFileAsync(IFormFile file, string containerName);
    Task<Post> PostMediaAsync(
        IFormFile file,
        List<int> humorTypeIds,
        string description,
        int userId,
        MediaType mediaType
    );
    Task<List<object>> GetUserPostsAsync(int userId);
    Task<object> GetUserStatsAsync(int userId);
    

}