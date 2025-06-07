public interface IGroupService
{
    Task<int> CreateGroupAsync(CreateGroupDTO groupDto);
    Task<bool> LeaveGroupAsync(int groupId, int userId);
    Task<bool> UpdateGroupNameAsync(int groupId, string newName, int actingUserId); 
    Task<GroupMessageReturnDTO> SendGroupMessageAsync(SendGroupMessageDTO messageDto);
    Task<List<GroupMessageReturnDTO>> GetGroupMessagesAsync(int groupId, int userId, int page, int pageSize);
    Task<bool> DeleteGroupMessageAsync(long messageId, int userId);
    Task<List<GroupDTO>> GetUserGroupsAsync(int userId);
}