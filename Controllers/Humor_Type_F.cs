using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class HumorType : ControllerBase
    {
    List<string> types_of_humors=["Dark Humor","Cringe in a funny way","Dad Jokes"];
    private readonly MemzyContext _context;
    public HumorType(MemzyContext context)
        {
            _context = context;
        }
    public IActionResult HumoreFirstTime([FromForm] List<string> types)
        {
            if (types == null || !types.Any())
            {
                return BadRequest("No humor types provided.");
            }

            var newTypes = new List<string>();
            foreach (var type in types)
            {
                if (!types_of_humors.Contains(type, StringComparer.OrdinalIgnoreCase))
                {
                    types_of_humors.Add(type);
                    newTypes.Add(type);
                }
            }

            if (newTypes.Any())
            {
                return Ok($"Added new type(s) of humor: {string.Join(", ", newTypes)}");
            }
            else
            {
                return BadRequest("All provided types of humor already exist in the list.");
            }
        }
    }
}