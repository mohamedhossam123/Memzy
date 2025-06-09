using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Memzy_finalist.Models.Entities;
namespace Memzy_finalist.Models
{
    public class Groups
    {
        [Key]
        public int GroupId { get; set; }
        public string GroupName { get; set; }
        
        public string ProfilePictureUrl { get; set; }
        public string PublicId { get; set; }
        public virtual ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
    public virtual ICollection<GroupMessage> Messages { get; set; } = new List<GroupMessage>();
    }
}