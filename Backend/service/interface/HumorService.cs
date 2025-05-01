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

                user.HumorTypeId = humorTypeEntity.HumorTypeId;
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
            // Since we now have a single humor type, AddHumor is essentially the same as ChangeHumor
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

                user.HumorTypeId = null;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing humor for user {UserId}", userId);
                throw;
            }
        }
    }
}