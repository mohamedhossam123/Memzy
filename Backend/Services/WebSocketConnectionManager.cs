
using System.Collections.Concurrent;
using System.Net.WebSockets;
public class WebSocketConnectionManager
{
    private readonly ConcurrentDictionary<int, WebSocket> _connections = new();

    public void Add(int userId, WebSocket socket) => _connections[userId] = socket;
    public void Remove(int userId) => _connections.TryRemove(userId, out _);
    public WebSocket Get(int userId) => _connections.TryGetValue(userId, out var socket) ? socket : null;
}

public class WebSocketHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WebSocketConnectionManager _manager;

    public WebSocketHandlerMiddleware(RequestDelegate next, WebSocketConnectionManager manager)
    {
        _next = next;
        _manager = manager;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
        {
            var userIdStr = context.User?.Claims?.FirstOrDefault(c => c.Type == "id")?.Value;
            if (int.TryParse(userIdStr, out int userId))
            {
                var socket = await context.WebSockets.AcceptWebSocketAsync();
                _manager.Add(userId, socket);

                var buffer = new byte[1024 * 4];
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        _manager.Remove(userId);
                        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                    }
                }
            }
            else
            {
                context.Response.StatusCode = 401;
            }
        }
        else
        {
            await _next(context);
        }
    }
}
