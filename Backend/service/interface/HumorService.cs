using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IHumorService
{
    Task<User> ChangeHumorAsync(int userId, List<string> humor);
    Task<User> AddHumorAsync(int userId, List<string> humor);
}

public class HumorService : IHumorService
{
    private readonly MemzyContext _context;
    private readonly ILogger<HumorService> _logger;
    
    private static readonly List<string> AllowedHumorTypes = new List<string> 
    { 
        "DarkHumor", 
        "FriendlyHumor" 
    };

    public HumorService(MemzyContext context, ILogger<HumorService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User> AddHumorAsync(int userId, List<string> humor)
    {
        ValidateHumorInput(humor);
        
        var user = await GetUserWithHumorPreferences(userId);
        var validHumorTypes = await GetValidHumorTypes();

        foreach (var humorTypeName in humor.Distinct())
        {
            var humorType = validHumorTypes.FirstOrDefault(ht => 
                ht.HumorTypeName == humorTypeName);

            if (humorType != null && !UserHasHumorPreference(user, humorType.HumorTypeId))
            {
                AddHumorPreference(user, humorType.HumorTypeId);
            }
        }

        await SaveChangesWithExceptionHandling();
        return user;
    }

    public async Task<User> ChangeHumorAsync(int userId, List<string> humor)
    {
        ValidateHumorInput(humor);
        
        var user = await GetUserWithHumorPreferences(userId);
        var validHumorTypes = await GetValidHumorTypes();

        user.UserHumorPreferences.Clear();

        foreach (var humorTypeName in humor.Distinct())
        {
            var humorType = validHumorTypes.FirstOrDefault(ht => 
                ht.HumorTypeName == humorTypeName);

            if (humorType != null)
            {
                AddHumorPreference(user, humorType.HumorTypeId);
            }
        }

        await SaveChangesWithExceptionHandling();
        return user;
    }

    #region Private Helper Methods

    private void ValidateHumorInput(List<string> humor)
    {
        if (humor == null || !humor.Any())
        {
            throw new ArgumentException("At least one humor type must be specified");
        }

        var invalidTypes = humor.Except(AllowedHumorTypes).ToList();
        if (invalidTypes.Any())
        {
            throw new ArgumentException(
                $"Invalid humor types: {string.Join(", ", invalidTypes)}. " +
                "Allowed types: DarkHumor, FriendlyHumor");
        }
    }

    private async Task<User> GetUserWithHumorPreferences(int userId)
    {
        return await _context.Users
            .Include(u => u.UserHumorPreferences)
            .ThenInclude(uh => uh.HumorType)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new ArgumentException("User not found");
    }

    private async Task<List<HumorType>> GetValidHumorTypes()
    {
        return await _context.HumorTypes
            .Where(ht => AllowedHumorTypes.Contains(ht.HumorTypeName))
            .ToListAsync();
    }

    private bool UserHasHumorPreference(User user, int humorTypeId)
    {
        return user.UserHumorPreferences.Any(uh => 
            uh.HumorTypeId == humorTypeId);
    }

    private void AddHumorPreference(User user, int humorTypeId)
{
    user.UserHumorPreferences.Add(new UserHumorPreference
    {
        UserId = user.UserId,
        HumorTypeId = humorTypeId
    });
}


    private async Task SaveChangesWithExceptionHandling()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database update failed");
            throw new ApplicationException("Failed to save humor preferences", ex);
        }
    }

    #endregion
}