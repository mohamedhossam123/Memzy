using System;
using System.Collections.Generic;

namespace Memzy_finalist.Models
{
    public partial class UserHumorPreference
    {
        public int UserHumorPreferenceId { get; set; }
        public int UserId { get; set; }
        public int HumorTypeId { get; set; }

        public virtual HumorType HumorType { get; set; }
        public virtual User User { get; set; }
    }
}
