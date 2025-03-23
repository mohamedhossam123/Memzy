using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class HumorType
    {
        public HumorType()
        {
            UserHumors = new HashSet<UserHumor>();
        }

        public int HumorTypeId { get; set; }
        public string HumorTypeName { get; set; }

        public virtual ICollection<UserHumor> UserHumors { get; set; }
    }
}
