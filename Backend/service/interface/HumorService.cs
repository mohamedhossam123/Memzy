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
        Task<User> ChangeHumorAsync(int userId, string humorType);
        Task<User> AddHumorAsync(int userId, string humorType);
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

        public async Task<User> ChangeHumorAsync(int userId, string humorType)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }

                if (!AllowedHumorTypes.Contains(humorType))
                {
                    throw new ArgumentException("Invalid humor type provided");
                }

                var humorTypeEntity = await _context.HumorTypes
                    .FirstOrDefaultAsync(h => h.HumorTypeName == humorType);

                if (humorTypeEntity == null)
                {
                    throw new ArgumentException("Humor type not found in database");
                }

                // Update or add the humor type association
                var existingUserHumorType = await _context.UserHumorTypes
                    .FirstOrDefaultAsync(uht => uht.UserId == userId);

                if (existingUserHumorType != null)
                {
                    existingUserHumorType.HumorTypeId = humorTypeEntity.HumorTypeId;
                }
                else
                {
                    // Add a new user-humor type association
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

        public async Task<User> AddHumorAsync(int userId, string humorType)
        {
            // Add humor is similar to change humor in this case
            return await ChangeHumorAsync(userId, humorType);
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

                // Remove humor type association
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
