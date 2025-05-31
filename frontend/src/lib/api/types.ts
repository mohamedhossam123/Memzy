// type.ts
export interface CommentResponseDto {
  commentId: number;
  postId: number;
  userId: number;
  userName: string;
  userProfilePicture: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export type Api = {
  get: (url: string, options?: any) => Promise<Response | null>;
  post: (url: string, data: any, options?: any) => Promise<Response | null>;
  put: (url: string, data: any, options?: any) => Promise<Response | null>;
  delete: (url: string, options?: any) => Promise<Response | null>;
};

export interface Post {
  postId: number;
  description: string;
  filePath: string | null;
  mediaType: 'image' | 'video' | null;
  authorName: string;
  authorId: string;
  createdAt: string;
  likeCount: number;
  isLiked?: boolean;
  isApproved: boolean;
  postHumors: {
    humorType: {
      id: number;
      name: string;
    };
  }[];
}

export interface UserProfileData {
  id: number;
  profilePictureUrl?: string;
  name?: string;
  bio?: string;
  friendsCount?: number;
  postsCount?: number;
  humorTypes?: { humorTypeName: string }[];
  userName?: string;
  status?: string;
  email?: string;
  createdAt?: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
  requestType?: string;
  requestId?: number;
}

export interface FriendshipStatus {
  isFriend: boolean;
  hasPendingRequest: boolean;
  requestType?: 'sent' | 'received';
  requestId?: number;
}