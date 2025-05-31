// Posts.tsx
import { ApiResponse, Api } from './types'

export const togglePostLike = async (
  api: Api,
  postId: number,
  isLiked: boolean
): Promise<ApiResponse<{ likeCount: number; isLiked: boolean }>> => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Posts/${postId}/like`
    
    const res = isLiked 
      ? await api.delete(endpoint)
      : await api.post(endpoint, {})
    
    if (!res || !res.ok) {
      return {
        status: res?.status || 500,
        error: 'Failed to update like status'
      }
    }
    
    const data = await res.json().catch(() => null)
    return { 
      data: data || { 
        likeCount: isLiked ? -1 : 1, 
        isLiked: !isLiked 
      }, 
      status: res.status 
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return {
      status: 500,
      error: 'Internal server error'
    }
  }
}