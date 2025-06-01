using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Memzy_finalist.Models.Entities
{
    public class CommentLike
    {
        [Key, Column(Order = 0)]
        public int CommentId { get; set; }

        [Key, Column(Order = 1)]
        public int UserId { get; set; }
        public virtual Comment Comment { get; set; }
        public virtual User User { get; set; }
    }
}