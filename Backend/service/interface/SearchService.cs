using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


public interface ISearchService
{
    Task<List<User>> SearchUsersAsync(string searchTerm);
}
public class SearchService : ISearchService
{
    private readonly MemzyContext _context;

    public SearchService(MemzyContext context)
    {
        _context = context;
    }

    public async Task<List<User>> SearchUsersAsync(string searchTerm)
{
    if (string.IsNullOrWhiteSpace(searchTerm))
        throw new ArgumentException("Search term cannot be empty");
    
    return await _context.Users
        .Where(u => u.Name.Contains(searchTerm))
        .OrderBy(u => u.Name)
        .Take(3)
        .ToListAsync();
}
}