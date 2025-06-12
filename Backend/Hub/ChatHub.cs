using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Memzy_finalist.Interfaces; 

namespace Memzy_finalist.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMessagingService _messagingService; 
        private readonly IGroupService _groupService;         

        public ChatHub(IMessagingService messagingService, IGroupService groupService)
        {
            _messagingService = messagingService;
            _groupService = groupService; 
        }
        public async Task SendMessage(int receiverId, string message, string tempId = null)
        {
            var senderId = int.Parse(Context.UserIdentifier);
            var savedMessageId = await _messagingService.SendMessageAsync(senderId, receiverId, message);

            var fullMessage = new
            {
                MessageId = savedMessageId,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = message,
                Timestamp = DateTime.UtcNow,
                TempId = tempId
            };
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", fullMessage);
            await Clients.User(senderId.ToString()).SendAsync("ReceiveMessage", fullMessage);
        }

        public async Task SendGroupMessage(int groupId, string messageContent, string tempId = null)
        {
            var senderId = int.Parse(Context.UserIdentifier);

            var sendGroupMessageDto = new SendGroupMessageDTO
            {
                GroupId = groupId,
                SenderId = senderId,
                Content = messageContent
            };

            try
            {
                var savedGroupMessage = await _groupService.SendGroupMessageAsync(sendGroupMessageDto);

                var messageToBroadcast = new
                {
                    savedGroupMessage.Id,
                    savedGroupMessage.GroupId,
                    savedGroupMessage.SenderId,
                    savedGroupMessage.Content,
                    savedGroupMessage.Timestamp,
                    savedGroupMessage.SenderUserName, 
                    TempId = tempId
                };

                await Clients.Group(groupId.ToString()).SendAsync("ReceiveGroupMessage", messageToBroadcast);

            }
            catch (UnauthorizedAccessException ex)
            {
                await Clients.Caller.SendAsync("ReceiveError", $"Error sending message: {ex.Message}");
            }
            catch (ArgumentException ex)
            {
                await Clients.Caller.SendAsync("ReceiveError", $"Error sending message: {ex.Message}");
            }
            catch (Exception )
            {
                await Clients.Caller.SendAsync("ReceiveError", "An unexpected error occurred while sending group message.");
            }
        }
        public async Task JoinGroup(int groupId)
        {
            var userId = int.Parse(Context.UserIdentifier);

            var isMember = await _groupService.GetUserGroupsAsync(userId); 
            if (isMember.Any(g => g.GroupId == groupId))
            {
                 await Groups.AddToGroupAsync(Context.ConnectionId, groupId.ToString());
                 await Clients.Caller.SendAsync("GroupJoined", groupId);
            }
            else
            {
                await Clients.Caller.SendAsync("ReceiveError", $"You are not authorized to join group {groupId}.");
            }
        }

        public async Task LeaveGroup(int groupId)
        {
            var userId = int.Parse(Context.UserIdentifier); 
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId.ToString());
            await Clients.Caller.SendAsync("GroupLeft", groupId);
        }


        public override async Task OnConnectedAsync()
        {
            var userId = int.Parse(Context.UserIdentifier);
            var userGroups = await _groupService.GetUserGroupsAsync(userId);
            foreach (var group in userGroups)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, group.GroupId.ToString());
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}