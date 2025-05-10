using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memzy_finalist.Services
{
    public interface IHumorService
{
   Task<User> ChangeHumorAsync(int userId, List<string> humorTypes);
    Task<User> AddHumorAsync(int userId, List<string> humorTypes);
    Task RemoveHumorAsync(int userId);
}


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
    try
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (humorTypes == null || !humorTypes.Any())
        {
            throw new ArgumentException("No humor types provided");
        }

        var validTypes = humorTypes
            .Where(ht => AllowedHumorTypes.Contains(ht))
            .ToList();

        if (!validTypes.Any())
        {
            throw new ArgumentException("No valid humor types provided");
        }

        // Remove existing humor preferences
        var existingPrefs = _context.UserHumorTypes
            .Where(uht => uht.UserId == userId);
        _context.UserHumorTypes.RemoveRange(existingPrefs);

        // Fetch the corresponding HumorType entities
        var humorTypeEntities = await _context.HumorTypes
            .Where(ht => validTypes.Contains(ht.HumorTypeName))
            .ToListAsync();

        foreach (var humorTypeEntity in humorTypeEntities)
        {
            _context.UserHumorTypes.Add(new UserHumorType
            {
                UserId = userId,
                HumorTypeId = humorTypeEntity.HumorTypeId
            });
        }

        await _context.SaveChangesAsync();
        return user;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error changing humor for user {UserId}", userId);
        throw;
    }
}


        public async Task<User> AddHumorAsync(int userId, List<string> humorTypes)
{
    return await ChangeHumorAsync(userId, humorTypes);
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
                var userHumorType = await _context.UserHumorTypes
                    .FirstOrDefaultAsync(uht => uht.UserId == userId);

                if (userHumorType != null)
                {
                    _context.UserHumorTypes.Remove(userHumorType);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new KeyNotFoundException("User humor preference not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing humor for user {UserId}", userId);
                throw;
            }
        }
    }
}
