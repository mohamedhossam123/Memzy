// HumorService.cs
using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Services
{
    public class HumorService : IHumorService
    {
        private readonly MemzyContext _context;
        private readonly ILogger<HumorService> _logger;

        private static readonly List<string> AllowedHumorTypes = new List<string>
        {
            "Dark Humor",
            "Friendly Humor"
        };

        public HumorService(MemzyContext context, ILogger<HumorService> logger)
        {
            _context = context;
            _logger = logger;
        }

       public async Task<User> ChangeHumorAsync(int userId, List<string> humorTypes)
{
    var user = await _context.Users.FindAsync(userId);
    if (user == null) throw new KeyNotFoundException("User not found");

    if (humorTypes?.Any() != true)
        throw new ArgumentException("No humor types provided");
    var humorTypeEntities = await _context.HumorTypes
        .Where(ht => humorTypes.Contains(ht.HumorTypeName))
        .ToListAsync();

    if (!humorTypeEntities.Any())
        throw new ArgumentException("No valid humor types provided");
    var existingPrefs = _context.UserHumorTypes.Where(uht => uht.UserId == userId);
    _context.UserHumorTypes.RemoveRange(existingPrefs);
    foreach (var humorType in humorTypeEntities)
    {
        _context.UserHumorTypes.Add(new UserHumorType 
        { 
            UserId = userId, 
            HumorTypeId = humorType.HumorTypeId 
        });
    }

    await _context.SaveChangesAsync();
    return user;
}

        public async Task RemoveHumorAsync(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }
                var userHumorTypes = _context.UserHumorTypes
                    .Where(uht => uht.UserId == userId);

                if (await userHumorTypes.AnyAsync())
                {
                    _context.UserHumorTypes.RemoveRange(userHumorTypes);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new KeyNotFoundException("User humor preferences not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing humor for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<string>> GetUserHumorPreferencesAsync(int userId)
        {
            try
            {
                var humorNames = await _context.UserHumorTypes
                    .Where(uht => uht.UserId == userId)
                    .Include(uht => uht.HumorType)
                    .Select(uht => uht.HumorType.HumorTypeName)
                    .ToListAsync();

                return humorNames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching humor preferences for user {UserId}", userId);
                throw;
            }
        }
    }
}
