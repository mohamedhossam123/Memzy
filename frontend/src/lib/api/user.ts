// lib/api/user.ts
export interface FullUser {
  profilePic?: string;
  name?: string;
  bio?: string;
  friendCount?: number;
  postCount?: number;
  humorTypes?: string[]; 
  userName?: string; 
}

export interface UserResponse {
  user?: any;
  profilePictureUrl?: string;
  name?: string;
  bio?: string;
  Bio?: string;
  userName?: string;
  UserName?: string;
}

export interface FriendPostCount {
  friendCount?: number;
  FriendCount?: number;
  postCount?: number;
  PostCount?: number;
}

export class UserAPI {
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

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(`${this.baseURL}/api/Auth/getCurrentUser`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  }

  async getUserById(id: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/Auth/GetUserByID?id=${id}`,
      { headers: this.getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user by ID');
    }
    
    return await response.json();
  }

  async getFriendPostCount(): Promise<FriendPostCount> {
    const response = await fetch(`${this.baseURL}/api/Auth/friend-post-count`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch friend and post count');
    }
    
    return await response.json();
  }

  async updateUsername(newName: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/User/UpdateUsername`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(newName)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update name');
    }
  }

  async updateProfilePicture(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('ProfilePicture', file);
    
    const response = await fetch(`${this.baseURL}/api/User/UpdateProfilePicture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile picture');
    }
  }

  async updateBio(newBio: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/User/UpdateUserBio`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(newBio)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update bio');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/User/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        currentPassword,  
        newPassword
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password update failed');
    }
  }

  async getPendingPosts(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/User/GetPendingPosts`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending posts');
    }
    
    return await response.json();
  }

  async getApprovedPosts(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/User/GetApprovedPosts`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch approved posts');
    }
    
    return await response.json();
  }

  async getUserPosts(userId: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/Posts/GetUserPosts/${userId}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }
    
    return await response.json();
  }
}