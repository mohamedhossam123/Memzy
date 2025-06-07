using Memzy_finalist.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq; // Added for .FirstOrDefault() in GetGroup
using System.Threading.Tasks;

namespace Memzy_finalist.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;
        private readonly IAuthenticationService _authService;
        private readonly ILogger<GroupsController> _logger;

        public GroupsController(IGroupService groupService, IAuthenticationService authService, ILogger<GroupsController> logger)
        {
            _groupService = groupService ?? throw new ArgumentNullException(nameof(groupService));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("create")] 
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDTO groupDto)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                groupDto.OwnerId = userId; 
                var groupId = await _groupService.CreateGroupAsync(groupDto);
                return CreatedAtAction(nameof(GetGroup), new { groupId }, new { GroupId = groupId });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid arg for group creation.");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating group.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpGet("{groupId}")] 
        public async Task<IActionResult> GetGroup(int groupId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var userGroups = await _groupService.GetUserGroupsAsync(userId);
                var group = userGroups.FirstOrDefault(g => g.GroupId == groupId);

                if (group == null) return NotFound(new { Error = $"Group {groupId} not found or not a member." });
                return Ok(group);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting group details.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpDelete("{groupId}/leave")] 
        public async Task<IActionResult> LeaveGroup(int groupId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _groupService.LeaveGroupAsync(groupId, userId);
                if (!result) return NotFound(new { Error = "Group or membership not found." });
                return Ok(new { Status = "Left group." });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Operation not allowed for leaving group.");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving group.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpPut("{groupId}/name")]
        public async Task<IActionResult> UpdateGroupName(int groupId, [FromBody] string newName)
        {
            try
            {
                var actingUserId = await _authService.GetAuthenticatedUserId();
                var result = await _groupService.UpdateGroupNameAsync(groupId, newName, actingUserId);
                if (!result) return NotFound(new { Error = "Group not found." });
                return Ok(new { Status = "Group name updated." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid arg for group name update.");
                return BadRequest(new { Error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized group name update.");
                return Unauthorized(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating group name.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpGet("{groupId}/messages")] 
        public async Task<IActionResult> GetGroupMessages(int groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var messages = await _groupService.GetGroupMessagesAsync(groupId, userId, page, pageSize);
                return Ok(new { messages });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid args for getting group messages.");
                return BadRequest(new { Error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to get group messages.");
                return Unauthorized(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting group messages.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpDelete("messages/{messageId}")] 
        public async Task<IActionResult> DeleteGroupMessage(long messageId)
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var result = await _groupService.DeleteGroupMessageAsync(messageId, userId);
                if (!result) return NotFound(new { Error = "Message not found or not authorized to delete." });
                return Ok(new { Status = "Group message deleted." });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to delete group message.");
                return Unauthorized(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting group message.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }

        [HttpGet("me")] 
        public async Task<IActionResult> GetMyGroups()
        {
            try
            {
                var userId = await _authService.GetAuthenticatedUserId();
                var groups = await _groupService.GetUserGroupsAsync(userId);
                return Ok(new { groups });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user groups.");
                return StatusCode(500, new { Error = "Internal server error." });
            }
        }
    }
}