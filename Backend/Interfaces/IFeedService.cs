public interface IFeedService
    {
        Task<FeedResultDTO> FeedGeneratorBasedOnHumor(int userId, int page, int pageSize);
        Task<FeedResultDTO> FeedGeneratorEverythingGoes(int page, int pageSize, int? currentUserId = null);
        Task<LikeResultDto> LikePostAsync(int postId, int userId);
        Task<LikeResultDto> UnlikePostAsync(int postId, int userId);
        Task<List<PostDto>> GetUserPostsAsync(int userId, int currentUserId);
        Task<LikeStatusDto> GetLikeStatusAsync(int postId, int userId);
    }