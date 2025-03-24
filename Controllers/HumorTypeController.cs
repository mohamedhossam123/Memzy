using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HumorTypeController : ControllerBase
    {
        private readonly MemzyContext _context;
        private readonly IUserService _userService;

        public HumorTypeController(MemzyContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpPost("HumoreFirstTime")]
        public async Task<IActionResult> ChangeHumorAsync([FromForm] int userid,[FromForm] List<string> type)
        {
            return await ChangeHumorAsync(userid, type);
    }
    
    }

}