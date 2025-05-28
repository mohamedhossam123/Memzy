using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;

namespace MyApiProject.Services
{

    public class MessagingService : IMessagingService
    {
        private readonly MemzyContext _context;
        private readonly ILogger<MessagingService> _logger;

        public MessagingService(
            MemzyContext context,
            ILogger<MessagingService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
    }
}
