using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApiProject.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IHumorService
{
    Task<User> ChangeHumorAsync(int userId, List<string> humor);/*---------------------------*/
    Task<User> AddHumorAsync(int userId, List<string> humor);/*---------------------------*/
}
public class HumorService : IHumorService
{
    private readonly MemzyContext _context;

    public HumorService(MemzyContext context)
    {
        _context = context;
    }
    private static readonly List<string> AllowedHumorTypes = new List<string> 
    { 
        "DarkHumor", 
        "FriendlyHumor" 
    };
    public async Task<User> AddHumorAsync(int userId, List<string> humor)
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

        var user = await _context.Users
            .Include(u => u.UserHumorPreferences)
            .ThenInclude(uh => uh.HumorType)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new ArgumentException("User not found");

        var validHumorTypes = await _context.HumorTypes
            .Where(ht => AllowedHumorTypes.Contains(ht.HumorTypeName))
            .ToListAsync();

        foreach (var humorTypeName in humor.Distinct())
        {
            var humorType = validHumorTypes.FirstOrDefault(ht => 
                ht.HumorTypeName == humorTypeName);

            if (humorType != null && !user.UserHumorPreferences.Any(uh => 
                uh.HumorTypeId == humorType.HumorTypeId))
            {
                user.UserHumorPreferences.Add(new UserHumorPreference
                {
                    HumorTypeId = humorType.HumorTypeId
                });
            }
        }

        await _context.SaveChangesAsync();
        return user;
    }
    public async Task<User> ChangeHumorAsync(int userId, List<string> humor)
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

        var user = await _context.Users
            .Include(u => u.UserHumorPreferences)
            .ThenInclude(uh => uh.HumorType)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new ArgumentException("User not found");

        var validHumorTypes = await _context.HumorTypes
            .Where(ht => AllowedHumorTypes.Contains(ht.HumorTypeName))
            .ToListAsync();

        user.UserHumorPreferences.Clear();

        foreach (var humorTypeName in humor.Distinct())
        {
            var humorType = validHumorTypes.FirstOrDefault(ht => 
                ht.HumorTypeName == humorTypeName);

            if (humorType != null)
            {
                user.UserHumorPreferences.Add(new UserHumorPreference
                {
                    HumorTypeId = humorType.HumorTypeId
                });
            }
        }

        await _context.SaveChangesAsync();
        return user;
    }
}