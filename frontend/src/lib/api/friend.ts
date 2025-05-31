// lib/api/friends.ts
export interface FriendRequestDTO {
  requestId: number;
  senderId: number;
  senderName: string;
  senderUserName: string;
  senderProfileImageUrl: string;
  receiverId: number;
  status: string;
  createdAt: string;
  respondedAt?: string;
  message: string;
}

export interface Friend {
  id: number;
  name: string;
  profilePictureUrl?: string;
}

export class FriendsAPI {
  private baseURL: string;
  private token: string;

  constructor(token: string) {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  async getFriends(): Promise<Friend[]> {
    const response = await fetch(`${this.baseURL}/api/Friends/GetFriends`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }
    
    return await response.json();
  }

  async getFriendshipStatus(targetUserId: number): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/Friends/GetFriendshipStatus/${targetUserId}`,
      { headers: this.getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch friendship status');
    }
    
    return await response.json();
  }

  async getFriendsAnotherUser(userId: string): Promise<Friend[]> {
    const response = await fetch(
      `${this.baseURL}/api/Friends/GetFriendsAnotherUser?userId=${userId}`,
      { headers: this.getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }
    
    return await response.json();
  }

  async getFriendRequests(): Promise<FriendRequestDTO[]> {
    const response = await fetch(`${this.baseURL}/api/Friends/GetFriendRequests`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch friend requests');
    }
    
    return await response.json();
  }

  async acceptRequest(requestId: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Friends/acceptRequest/${requestId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept request');
    }
  }

  async rejectRequest(requestId: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Friends/rejectrequest/${requestId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject request');
    }
  }

  async removeFriend(friendId: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Friends/RemoveFriend?friendId=${friendId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove friend');
    }
  }

  async sendRequest(targetUserId: number): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/Friends/SendRequest/${targetUserId}`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to send friend request');
    }
    
    return await response.json();
  }

  async cancelRequest(requestId: number): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/Friends/cancelrequest/${requestId}`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to cancel friend request');
    }
  }
}