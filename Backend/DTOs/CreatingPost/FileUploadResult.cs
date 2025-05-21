using Memzy_finalist.Models;
using System.ComponentModel.DataAnnotations;
public class FileUploadResult
{
    [Required]
    public string FilePath { get; set; } = string.Empty;
    [Required]
    public string FileName { get; set; } = string.Empty;
    [Required]
    public string ContentType { get; set; } = string.Empty;
}