public class LikeResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int LikeCount { get; set; }
        public bool IsLiked { get; set; }
    }

    public class LikeStatusDto
    {
        public bool IsLiked { get; set; }
        public int LikeCount { get; set; }
    }