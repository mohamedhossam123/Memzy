using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using MoreLinq.Experimental;

namespace Memzy_finalist.Services
{
    public class GroupService : IGroupService
    {
        private readonly MemzyContext _context;
    private readonly ILogger<GroupService> _logger;

    public GroupService(MemzyContext context, ILogger<GroupService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
        public async Task<int> CreateGroupAsync(CreateGroupDTO groupDto)
        {
            var newGroup = new Groups
            {
                GroupName = groupDto.GroupName,
                Members = new List<GroupMember>(),
                Messages = new List<GroupMessage>()
            };
            newGroup.Members.Add(new GroupMember
            {
                UserId = groupDto.OwnerId,
                Group = newGroup,
                JoinedAt = DateTime.UtcNow
            });
            if (groupDto.MemberIds != null && groupDto.MemberIds.Any())
            {
                var distinctMemberIds = groupDto.MemberIds
                .Where(id => id != groupDto.OwnerId)
                .Distinct()
                .ToList();
                if (distinctMemberIds.Any())
                {
                    var existingMembers = await _context.Users
                                                        .Where(u => distinctMemberIds.Contains(u.UserId))
                                                        .Select(u => u.UserId)
                                                        .ToListAsync();
                    foreach (var memberId in distinctMemberIds)
                    {
                        if (existingMembers.Contains(memberId))
                        {
                            newGroup.Members.Add(new GroupMember
                            {
                                UserId = memberId,
                                Group = newGroup,
                                JoinedAt = DateTime.UtcNow
                            });
                        }
                        else
                        {
                            Console.WriteLine($"Warning: Member with ID {memberId} not found and will be skipped.");
                        }
                    }
                }
            }
            _context.Groups.Add(newGroup);
            await _context.SaveChangesAsync();
            return newGroup.GroupId;
        }

        public async Task<bool> LeaveGroupAsync(int groupId, int userId)
        {
            var groupmember = await _context.GroupMembers.FirstOrDefaultAsync(me => me.GroupId == groupId && me.UserId == userId);

            _context.GroupMembers.Remove(groupmember);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateGroupNameAsync(int groupId, string newName, int actingUserId)
        {
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.GroupId == groupId);
            if (group == null)
            {
                return false;
            }
            group.GroupName = newName;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteGroupMessageAsync(long messageId, int userId)
        {
            var message = await _context.GroupMessages
        .Where(gm => gm.Id == messageId)
        .Where(i => i.SenderId == userId)
        .FirstOrDefaultAsync();
            if (message == null) return false;
            _context.GroupMessages.Remove(message);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<GroupDTO>> GetUserGroupsAsync(int userId)
        {
            var userGroups = await _context.GroupMembers
            .Where(gm => gm.UserId == userId)
            .Select(gm => new GroupDTO
            {
                GroupId = gm.GroupId,
                GroupName = gm.Group.GroupName,
                MemberCount = gm.Group.Members.Count()
            })
            .ToListAsync();
            return userGroups;
        }
        public async Task<GroupMessageReturnDTO> SendGroupMessageAsync(SendGroupMessageDTO messageDto)
    {
        if (messageDto == null)
        {
            throw new ArgumentNullException(nameof(messageDto));
        }
        if (messageDto.GroupId <= 0 || messageDto.SenderId <= 0 || string.IsNullOrWhiteSpace(messageDto.Content))
        {
            throw new ArgumentException("Invalid message data.");
        }

        var isMember = await _context.GroupMembers
                                     .AnyAsync(gm => gm.GroupId == messageDto.GroupId && gm.UserId == messageDto.SenderId);
        if (!isMember)
        {
            _logger.LogWarning($"User {messageDto.SenderId} attempted to send message to group {messageDto.GroupId} but is not a member.");
            throw new UnauthorizedAccessException($"User is not a member of group {messageDto.GroupId}.");
        }

        var groupMessage = new GroupMessage
        {
            GroupId = messageDto.GroupId,
            SenderId = messageDto.SenderId,
            Content = messageDto.Content,
            Timestamp = DateTime.UtcNow
        };

        _context.GroupMessages.Add(groupMessage);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Group message sent by user {messageDto.SenderId} to group {messageDto.GroupId}. Message ID: {groupMessage.Id}");

        var senderUser = await _context.Users.FindAsync(groupMessage.SenderId);
        string senderUserName = senderUser?.UserName ?? "Unknown";

        return new GroupMessageReturnDTO
        {
            Id = groupMessage.Id,
            GroupId = groupMessage.GroupId,
            SenderId = groupMessage.SenderId,
            Content = groupMessage.Content,
            Timestamp = groupMessage.Timestamp,
            SenderUserName = senderUserName
        };
    }
        public async Task<List<GroupMessageReturnDTO>> GetGroupMessagesAsync(int groupId, int userId, int page, int pageSize)
    {
        if (groupId <= 0 || userId <= 0 || page <= 0 || pageSize <= 0)
        {
            _logger.LogWarning($"Invalid parameters for GetGroupMessagesAsync: GroupId={groupId}, UserId={userId}, Page={page}, PageSize={pageSize}");
            return new List<GroupMessageReturnDTO>();
        }

        var isMember = await _context.GroupMembers
                                     .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning($"User {userId} attempted to retrieve messages from group {groupId} but is not a member.");
            return new List<GroupMessageReturnDTO>();
        }

        return await _context.GroupMessages
            .Include(gm => gm.Sender)
            .Where(gm => gm.GroupId == groupId)
            .OrderByDescending(gm => gm.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(gm => new GroupMessageReturnDTO
            {
                Id = gm.Id,
                GroupId = gm.GroupId,
                SenderId = gm.SenderId,
                Content = gm.Content,
                Timestamp = gm.Timestamp,
                SenderUserName = gm.Sender != null ? gm.Sender.UserName : "Unknown"
            })
            .ToListAsync();
    }
}
}
