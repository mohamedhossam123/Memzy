// lib/api/comments.tsx
import { CommentResponseDto, ApiResponse, Api } from './types'

export const fetchComments = async (
  api: Api,
  postId: number
): Promise<ApiResponse<CommentResponseDto[]>> => {
  try {
    console.log(`Fetching comments for post ${postId}`)
    const url = `/api/user/comments/getComments?postId=${postId}`
    console.log('Request URL:', url)

    const res = await api.get(url)
    if (!res) {
      console.error('No response received')
      return {
        status: 500,
        error: 'No response from server',
      }
    }

    console.log('Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Comments API Error:', res.status, errorText)
      return {
        status: res.status,
        error: errorText || 'Failed to fetch comments',
      }
    }

    const data = await res.json()
    console.log('Comments data:', data)
    return { data, status: res.status }
  } catch (err) {
    console.error('Error fetching comments:', err)
    return {
      status: 500,
      error: err instanceof Error ? err.message : 'Internal server error',
    }
  }
}

export const addComment = async (
  api: Api,
  postId: number,
  content: string,
  parentCommentId: number | null = null
): Promise<ApiResponse<CommentResponseDto>> => {
  try {
    const res = await api.post('/api/user/comments/addComment', {
      postId,
      content: content.trim(),
      parentCommentId, 
    })

    if (!res || !res.ok) {
      return {
        status: res?.status || 500,
        error: 'Failed to post comment',
      }
    }

    const data = await res.json()
    return { data, status: res.status }
  } catch (err) {
    console.error('Error posting comment:', err)
    return {
      status: 500,
      error: 'Internal server error',
    }
  }
}

export const toggleCommentLike = async (
  api: Api,
  commentId: number
): Promise<ApiResponse<{ likeCount: number; isLiked: boolean }>> => {
  try {
    const res = await api.post('/api/user/comments/toggleLikeComments', {
      commentId,
    })
    if (!res || !res.ok) {
      return {
        status: res?.status || 500,
        error: 'Failed to toggle comment like',
      }
    }

    const data = await res.json()
    return { data, status: res.status }
  } catch (err) {
    console.error('Error toggling comment like:', err)
    return {
      status: 500,
      error: 'Internal server error',
    }
  }
}

export const deleteComment = async (
  api: Api,
  dto: { commentId: number; userId: number } 
): Promise<ApiResponse<boolean>> => {
  try {
    const res = await api.delete('/api/user/comments/deleteComment', {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!res || !res.ok) {
      const errorText = await res?.text() || 'Failed to delete comment';
      return {
        status: res?.status || 500,
        error: errorText,
      }
    }

    return { data: true, status: res.status }
  } catch (err) {
    console.error('Error deleting comment:', err)
    return {
      status: 500,
      error: 'Internal server error',
    }
  }
}

export const fetchCommentCount = async (
  api: Api,
  postId: number
): Promise<ApiResponse<{ totalCount: number; topLevelComments: number; replies: number }>> => {
  try {
    const res = await api.get(`/api/user/comments/GetCommentCount?postId=${postId}`);

    if (!res || !res.ok) {
      return {
        status: res?.status || 500,
        error: 'Failed to fetch comment count',
      };
    }

    const data = await res.json();
    return { data, status: res.status };
  } catch (err) {
    console.error('Error fetching comment count:', err);
    return {
      status: 500,
      error: err instanceof Error ? err.message : 'Internal server error',
    };
  }
};