
using System.Collections.Concurrent;
using System.Net.WebSockets;
public class WebSocketConnectionManager
{
    private readonly ConcurrentDictionary<int, WebSocket> _connections = new();

    public void Add(int userId, WebSocket socket) => _connections[userId] = socket;
    public void Remove(int userId) => _connections.TryRemove(userId, out _);
    public WebSocket Get(int userId) => _connections.TryGetValue(userId, out var socket) ? socket : null;
}
