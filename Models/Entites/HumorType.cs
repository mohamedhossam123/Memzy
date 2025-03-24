using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class HumorType
    {
        public HumorType()
        {
            UserHumorPreferences = new HashSet<UserHumorPreference>();
        }

        public int HumorTypeId { get; set; }
        public string HumorTypeName { get; set; }

        public virtual ICollection<UserHumorPreference> UserHumorPreferences { get; set; }
    }
}
