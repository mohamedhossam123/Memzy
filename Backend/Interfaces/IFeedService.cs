
public interface IFeedService
{
    Task<FeedResultDTO> FeedGeneratorBasedOnHumor(int userId);
    Task<FeedResultDTO> FeedGeneratorEverythingGoes();
}