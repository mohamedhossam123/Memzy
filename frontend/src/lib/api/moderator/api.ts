// lib/api/moderator/api.ts
import { 
  PendingPost, 
  User,
  ApprovePostRequest,
  DeletePostRequest,
  DeleteUserRequest,
  MakeModeratorRequest
} from '../types';

export class ModeratorAPI {
  private baseURL: string;
  private token: string;

  constructor(token: string) {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
    this.token = token;
  }

  private getHeaders(contentType = 'application/json') {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': contentType
    };
  }

  async fetchPendingPosts(): Promise<PendingPost[]> {
    const response = await fetch(`${this.baseURL}/api/Moderator/pendingPosts`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return await response.json();
  }

  async fetchAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseURL}/api/Moderator/users`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    return await response.json();
  }

  async approvePost(data: ApprovePostRequest): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Moderator/approvePost`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to approve post: ${response.status}`);
    }
  }

  async rejectPost(data: DeletePostRequest): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Moderator/deletePost`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reject post: ${response.status}`);
    }
  }

  async deleteUser(data: DeleteUserRequest): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Moderator/deleteUser`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  }

  async makeModerator(data: MakeModeratorRequest): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/Moderator/makeModerator`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.Message || 'Failed to promote user');
    }
  }
}