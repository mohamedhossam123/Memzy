using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Memzy_finalist.Hubs
{
    [Authorize]  // Require authentication
    public class ChatHub : Hub
{
    private readonly IMessagingService _messagingService;
    public ChatHub(IMessagingService messagingService) => _messagingService = messagingService;

    public async Task SendMessage(int receiverId, string message)
    {
        var senderId = int.Parse(Context.UserIdentifier);
        await _messagingService.SendMessageAsync(senderId, receiverId, message);
        await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", senderId, message);
    }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
