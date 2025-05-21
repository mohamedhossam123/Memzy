using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;    
using Microsoft.AspNetCore.Http;
using Memzy_finalist.Models;
public class CreatePostRequest
{
    [Required(ErrorMessage = "File is required")]
    public IFormFile File { get; set; }

    [Required(ErrorMessage = "At least one humor type is required")]
    [MinLength(1, ErrorMessage = "At least one humor type is required")]
    public List<int> HumorTypeIds { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Media type is required")]
    public MediaType MediaType { get; set; }
}