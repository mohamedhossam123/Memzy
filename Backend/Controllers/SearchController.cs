using Memzy_finalist.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet("userSearch")] 
public async Task<IActionResult> SearchUser([FromForm] string searchTerm)
{
    try
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return BadRequest("Search term is required");
        
        var users = await _searchService.SearchUsersAsync(searchTerm);
        
        if (users == null || !users.Any())
            return NotFound("No users found");
            
        return Ok(users);
    }
    catch (Exception  )
    
    {
        return StatusCode(500, "An error occurred while processing your request");
    }
}
    }
}