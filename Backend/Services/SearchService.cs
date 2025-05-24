using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;


public class SearchService : ISearchService
{
    private readonly MemzyContext _context;

    public SearchService(MemzyContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> SearchUsersAsync(string searchTerm)
{
    if (string.IsNullOrWhiteSpace(searchTerm))
        throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));
    
    var normalizedTerm = searchTerm.Trim().ToLowerInvariant();

    var users = await _context.Users
        .Where(u =>
            u.Name.ToLower().Contains(normalizedTerm) ||
            u.UserName.ToLower().Contains(normalizedTerm))
        .OrderBy(u => u.Name)
        .Take(3)
        .ToListAsync()
        .ConfigureAwait(false);

    return users.Select(u => new UserDto
    {
        Id = u.UserId.ToString(),
        Name = u.Name,
        UserName = u.UserName,
        ProfilePictureUrl = u.ProfilePictureUrl,
        Bio = u.Bio
    }).ToList();
}

}