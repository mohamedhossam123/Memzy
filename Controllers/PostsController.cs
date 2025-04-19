using Memzy_finalist.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApiProject.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly MemzyContext _context;
    private readonly IPostingService _postingService;

    public PostsController(MemzyContext context, IPostingService postingService)
    {
        _context = context;
        _postingService = postingService;
    }
    [HttpPost("GetFirst3postsOfImagesAndVideos")]
    public async Task<IActionResult> GetVideosAsync()
    {
        
        var postsvid = _context.Videos;
        var First_3_videos = await postsvid.Take(3).ToListAsync();
        var postsImg = _context.Images;
        var First_3_Img = await postsImg.Take(3).ToListAsync();
        return Ok(new {
        Video = First_3_videos,
        Image = First_3_Img
    })
    ;
    }

}



}