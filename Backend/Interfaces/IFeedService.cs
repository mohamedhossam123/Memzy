
public interface IFeedService
{
    Task<FeedResultDTO> FeedGeneratorBasedOnHumor(int userId, int page, int pageSize);
    Task<FeedResultDTO> FeedGeneratorEverythingGoes(int page, int pageSize);
}
