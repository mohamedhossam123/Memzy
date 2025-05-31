// types.tsx
export interface CommentResponseDto {
  commentId: number
  postId: number
  userId: number
  userName: string
  userProfilePicture: string | null
  content: string
  createdAt: string
  likeCount: number
  isLikedByCurrentUser: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export type Api = {
  get: (url: string, options?: any) => Promise<Response | null>
  post: (url: string, data: any, options?: any) => Promise<Response | null>
  put: (url: string, data: any, options?: any) => Promise<Response | null>
  delete: (url: string, options?: any) => Promise<Response | null>
}