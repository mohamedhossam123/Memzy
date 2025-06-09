// lib/api/types.ts 

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

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
  parentCommentId?: number | null;
  replies?: CommentResponseDto[];
}

export interface User {
  userId: number; 
  name: string;
  email: string;
  username: string; 
  status: string;
  profilePictureUrl?: string;
}

export interface UserProfileData {
  userId: number; 
  profilePictureUrl?: string;
  name?: string;
  bio?: string;
  friendsCount?: number;
  postsCount?: number;
  humorTypes?: { humorTypeName: string }[];
  username?: string; 
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

export interface PendingPost {
  id: number;
  author?: string;
  username?: string; 
  content: string;
  mediaType?: 'image' | 'video' | null;
  mediaUrl?: string | null;
  timestamp: string;
  humorType: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  userId: number; 
  user: User; 
}

export interface ApprovePostRequest { postId: number; modId: number; }
export interface DeletePostRequest { postId: number; modId: number; }
export interface DeleteUserRequest { id: number; modId: number; }
export interface MakeModeratorRequest { userId: number; requestedById: number; }

export interface ResetPasswordDto { token: string; newPassword: string; }
export interface ForgotPasswordResponse { success: boolean; message: string; }
export interface ResetPasswordResponse { success: boolean; message: string; }


export interface Friend {
  userId: number;
  name: string;
  username: string;
  profilePictureUrl?: string;
}

export interface Group {
  groupId: number;
  groupName: string;
  memberCount: number;
  profilePictureUrl?: string;
}

export interface Message {
  id: number; 
  content: string;
  timestamp: string;
  senderId: number;
  receiverId?: number;
  groupId?: number;
  senderName?: string;
  senderUserName?: string;
  profilePictureUrl?: string;
}

export interface PendingMessage extends Omit<Message, 'id'> { 
  messageId: -1; 
  isPending: boolean;
  tempId: string;
  formattedTime: string;
}


export interface ExtendedMessage extends Message {
  formattedTime: string;
  messageId: number; 
  isPending?: boolean;
  tempId?: string;
}