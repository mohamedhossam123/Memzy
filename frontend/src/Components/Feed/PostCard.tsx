'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/Context/AuthContext'
import Link from 'next/link'
import {
  CommentResponseDto,
  togglePostLike,
  fetchComments as fetchCommentsApi,
  addComment as addCommentApi,
  toggleCommentLike as toggleCommentLikeApi,
  deleteComment as deleteCommentApi,
  fetchCommentCount as fetchCommentCountApi,
} from '@/lib/api'

export interface PostProps {
  id: number
  author: string
  content: string
  mediaType?: 'image' | 'video' | null
  authorName?: string
  authorId?: string
  mediaUrl?: string | null
  timestamp: string
  humorType: 'Dark Humor' | 'Friendly Humor'
  likes: number
  profileImageUrl?: string | null
  isLiked?: boolean
  onLikeUpdate?: (postId: number, isLiked: boolean, likes: number) => void
}

export default function PostCard({
  id,
  author,
  content,
  mediaType,
  mediaUrl,
  timestamp,
  humorType,
  likes: initialLikes,
  isLiked: initialIsLiked = false,
  authorId = '',
  authorName,
  profileImageUrl,
}: PostProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  const [comments, setComments] = useState<CommentResponseDto[]>([])
  const [newComment, setNewComment] = useState('')
  const [isCommentsVisible, setIsCommentsVisible] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [localCommentCount, setLocalCommentCount] = useState(0)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(new Set())

  const { api, user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const commentFormRef = useRef<HTMLDivElement>(null)

  const UpdateSubComments = useCallback((
    commentsArray: CommentResponseDto[],
    targetCommentId: number,
    updateFn: (comment: CommentResponseDto) => CommentResponseDto | null
  ): CommentResponseDto[] => {
    return commentsArray.flatMap(comment => {
      if (comment.commentId === targetCommentId) {
        const updatedComment = updateFn(comment)
        return updatedComment ? [updatedComment] : []
      }

      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = UpdateSubComments(comment.replies, targetCommentId, updateFn)
        if (updatedReplies.length !== comment.replies.length ||
            !updatedReplies.every((val, index) => val === comment.replies![index])) {
          return [{ ...comment, replies: updatedReplies }]
        }
      }
      return [comment]
    })
  }, [])
  const fetchComments = useCallback(async () => {
    if (!user) return
    setIsLoadingComments(true)
    try {
      const response = await fetchCommentsApi(api, id)
      console.log('Comments API Response:', response)
      if (response.data) {
        const sortedComments = Array.isArray(response.data)
          ? response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : []
        setComments(sortedComments)
        setLocalCommentCount(sortedComments.length)
      } else {
        console.error('Failed to fetch comments:', response.error)
        setComments([])
        setLocalCommentCount(0)
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      setComments([])
      setLocalCommentCount(0)
    } finally {
      setIsLoadingComments(false)
    }
  }, [api, id, user])

  useEffect(() => {
    if (user) {
      fetchComments()
    }
  }, [user, fetchComments])

  const submitComment = async (parentCommentId: number | null = null) => {
    const commentToSubmit = parentCommentId ? replyContent : newComment
    if (!commentToSubmit.trim() || isSubmittingComment || !user) return

    setIsSubmittingComment(true)
    const optimisticCommentId = Date.now()
    const optimisticComment: CommentResponseDto = {
      commentId: optimisticCommentId,
      postId: id,
      userId: user.userId,
      userName: user.userName ?? 'Unknown',
      userProfilePicture: user.profilePictureUrl || null,
      content: commentToSubmit.trim(),
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLikedByCurrentUser: false,
      parentCommentId: parentCommentId,
      replies: [],
    }
    setComments(prev => {
      if (parentCommentId) {
        return UpdateSubComments(prev, parentCommentId, (parentComment) => ({
          ...parentComment,
          replies: [...(parentComment.replies || []), optimisticComment],
        }))
      } else {
        return [optimisticComment, ...prev]
      }
    })

    if (parentCommentId) {
      setReplyContent('')
      setReplyingToCommentId(null)
    } else {
      setNewComment('')
    }
    setLocalCommentCount(prev => prev + 1)

    try {
      const response = await addCommentApi(api, id, commentToSubmit.trim(), parentCommentId)

      if (response.data) {
        setComments(prev =>
          UpdateSubComments(prev, optimisticCommentId, () => response.data!)
        )
      } else {
        console.error('Failed to post comment:', response.error)
        setComments(prev =>
          UpdateSubComments(prev, optimisticCommentId, () => null)
        )
        setLocalCommentCount(prev => prev - 1)
      }
    } catch (err) {
      console.error('Error posting comment:', err)
      setComments(prev =>
        UpdateSubComments(prev, optimisticCommentId, () => null)
      )
      setLocalCommentCount(prev => prev - 1)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const toggleCommentLike = async (commentId: number) => {
    if (!user) return
    setComments(prevComments =>
      UpdateSubComments(prevComments, commentId, (comment) => ({
        ...comment,
        isLikedByCurrentUser: !comment.isLikedByCurrentUser,
        likeCount: comment.isLikedByCurrentUser ? comment.likeCount - 1 : comment.likeCount + 1,
      }))
    )

    try {
      const response = await toggleCommentLikeApi(api, commentId)
      if (response.data) {
        setComments(prev =>
          UpdateSubComments(prev, commentId, (comment) => ({
            ...comment,
            likeCount: response.data!.likeCount,
            isLikedByCurrentUser: response.data!.isLiked,
          }))
        )
      } else {
        console.error('Failed to toggle comment like:', response.error)
        setComments(prevComments =>
          UpdateSubComments(prevComments, commentId, (comment) => ({
            ...comment,
            isLikedByCurrentUser: !comment.isLikedByCurrentUser,
            likeCount: comment.isLikedByCurrentUser ? comment.likeCount + 1 : comment.likeCount - 1,
          }))
        )
      }
    } catch (err) {
      console.error('Error toggling comment like:', err)
      setComments(prevComments =>
        UpdateSubComments(prevComments, commentId, (comment) => ({
          ...comment,
          isLikedByCurrentUser: !comment.isLikedByCurrentUser,
          likeCount: comment.isLikedByCurrentUser ? comment.likeCount + 1 : comment.likeCount - 1,
        }))
      )
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!user) return

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setComments(prev => UpdateSubComments(prev, commentId, () => null))
    setLocalCommentCount(prev => prev - 1)

    try {
      const response = await deleteCommentApi(api, {
        commentId,
        userId: user.userId,
      })
      if (!response.data) {
        console.error('Failed to delete comment:', response.error)
        fetchComments()
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      fetchComments()
    }
  }

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await fetchCommentCountApi(api, id)
        if (response.data !== undefined) {
          setLocalCommentCount(response.data)
        }
      } catch (err) {
        console.error('Error fetching comment count:', err)
      }
    }

    if (user) {
      fetchCommentCount()
    }
  }, [api, id, user])

  useEffect(() => {
    if (isCommentsVisible && comments.length === 0) {
      fetchComments()
    }
  }, [isCommentsVisible, comments.length, fetchComments])

  useEffect(() => {
    if (isCommentsVisible && commentFormRef.current) {
      commentFormRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isCommentsVisible, comments.length])

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const getOptimizedMediaUrl = (url: string, type: 'image' | 'video') => {
    if (!url.includes('cloudinary.com')) return url

    if (type === 'image') {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/')
    } else if (type === 'video') {
      return url.replace('/upload/', '/upload/q_auto,w_800,c_limit/')
    }

    return url
  }

  const handleLikeToggle = async () => {
    if (isLikeLoading || !user) return
    setIsLikeLoading(true)

    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? likes + 1 : likes - 1
    setIsLiked(newIsLiked)
    setLikes(newLikes)

    try {
      const response = await togglePostLike(api, id, isLiked)
      if (response.data) {
        setLikes(response.data.likeCount)
        setIsLiked(response.data.isLiked)
      } else {
        setIsLiked(!newIsLiked)
        setLikes(newIsLiked ? likes : likes + 1)
        console.error('Failed to update like:', response.error)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      setIsLiked(!newIsLiked)
      setLikes(newIsLiked ? likes : likes + 1)
    } finally {
      setIsLikeLoading(false)
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!videoElement) return

          if (entry.isIntersecting) {
            if (videoElement.paused && videoElement.readyState >= 2) {
              videoElement.play().catch(() => {})
            }
          } else {
            videoElement.pause()
            videoElement.currentTime = 0
          }
        })
      },
      {
        threshold: 0.5,
      }
    )
    observer.observe(videoElement)
    return () => {
      observer.disconnect()
    }
  }, [])

  const toggleRepliesCollapse = (commentId: number) => {
    setCollapsedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const renderComment = (comment: CommentResponseDto, isReply: boolean = false) => {
    const hasReplies = comment.replies && comment.replies.length > 0
    const areRepliesCollapsed = collapsedReplies.has(comment.commentId)

    return (
      <div key={comment.commentId} className={`bg-glass/20 p-3 rounded-xl border border-glass ${isReply ? 'ml-8 mt-3' : ''}`}>
        <div className="flex items-center gap-3">
          {comment.userProfilePicture ? (
            <img
              src={comment.userProfilePicture}
              alt={`${comment.userName}'s profile`}
              className="w-8 h-8 rounded-full object-cover border border-glass/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-glass/30 flex items-center justify-center text-xs text-light/70 border border-glass/40">
              👤
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-light">{comment.userName}</p>
            <p className="text-xs text-light/50">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <p className="mt-2 text-light/90 whitespace-pre-line">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => toggleCommentLike(comment.commentId)}
            className={`text-lg transition-colors duration-200 ${
              comment.isLikedByCurrentUser
                ? 'text-accent'
                : 'text-light/50 hover:text-accent'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!user}
            title={!user ? 'Login to like comments' : undefined}
          >
            {comment.isLikedByCurrentUser ? '❤️' : '🤍'}
          </button>
          <span className="text-sm text-light/70">{comment.likeCount}</span>
          {user && user.userId === comment.userId && (
            <button
              onClick={() => deleteComment(comment.commentId)}
              className="text-red-400 hover:text-red-500 text-sm ml-auto opacity-70 hover:opacity-100 transition-opacity"
              title="Delete comment"
            >
              🗑️ Delete
            </button>
          )}
          {user && (
            <button
              onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}
              className="text-accent hover:text-accent/80 text-sm transition-colors"
            >
              💬 Reply
            </button>
          )}
        </div>

        {replyingToCommentId === comment.commentId && user && (
          <div className="flex gap-2 mt-3 pl-0 sm:pl-8"> {/* Adjusted padding for smaller screens */}
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.userName}...`}
              className="flex-1 bg-glass/5 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent focus:shadow-sm text-sm"
              disabled={isSubmittingComment}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment(comment.commentId);
                }
              }}
            />
            <button
              onClick={() => submitComment(comment.commentId)}
              disabled={isSubmittingComment || !replyContent.trim()}
              className="bg-accent/20 text-accent px-3 py-1 rounded-xl hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              {isSubmittingComment ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mx-1"></div>
              ) : (
                'Reply'
              )}
            </button>
            <button
              onClick={() => setReplyingToCommentId(null)}
              className="bg-red-400/20 text-red-400 px-3 py-1 rounded-xl hover:bg-red-400/30 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Render Replies Section with Toggle */}
        {hasReplies && (
          <div className="mt-3 pl-6 border-l border-glass/30"> {/* Added left border for visual hierarchy */}
            <button
              onClick={() => toggleRepliesCollapse(comment.commentId)}
              className="text-light/60 hover:text-accent text-sm flex items-center transition-colors mb-2"
            >
              {areRepliesCollapsed ? (
                <>
                  ▶️ Show {comment.replies!.length} replies
                </>
              ) : (
                <>
                  ▼ Hide replies
                </>
              )}
            </button>
            {!areRepliesCollapsed && (
              <div className="mt-2 space-y-3"> {/* Increased space between nested replies */}
                {comment.replies!.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
  <div className="bg-glass/30 border border-glass rounded-2xl p-5 shadow-xl space-y-4 w-full max-w-2xl mx-auto transition duration-300 hover:shadow-2xl">
    {/* Header */}
    <div className="flex items-center gap-4">
      {profileImageUrl ? (
        <img src={profileImageUrl} alt="Author" className="w-10 h-10 rounded-full object-cover border border-glass" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-sm text-light/70 border border-glass">
          👤
        </div>
      )}
      <div className="flex flex-col">
        <Link href={`/profile/${authorId}`} className="font-semibold hover:underline text-light">{authorName || author}</Link>
        <span className="text-xs text-light/60">{new Date(timestamp).toLocaleString()}</span>
      </div>
      <div className="ml-auto text-xs px-2 py-1 bg-glass/10 border border-glass rounded-full text-light/60">{humorType}</div>
    </div>

    {/* Content */}
    <p className="text-light/90 whitespace-pre-line">{content}</p>

    {/* Media */}
    {mediaType && mediaUrl && (
      <div className="rounded-xl overflow-hidden border border-glass">
        {mediaType === 'image' ? (
          <img
            src={getOptimizedMediaUrl(mediaUrl, 'image')}
            alt="Post Media"
            className="w-full max-h-[400px] object-cover rounded-xl transition-opacity duration-300"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <video
            src={getOptimizedMediaUrl(mediaUrl, 'video')}
            controls
            loop
            ref={videoRef}
            className="w-full max-h-[400px] object-cover rounded-xl"
            onError={() => setVideoError(true)}
            onEnded={handleVideoEnd}
          />
        )}
      </div>
    )}

    {/* Post actions */}
    <div className="flex items-center gap-5 text-light/80">
      <button
        onClick={handleLikeToggle}
        className={`text-lg flex items-center gap-1 ${isLiked ? 'text-accent' : 'hover:text-accent'} disabled:opacity-50`}
        disabled={isLikeLoading || !user}
      >
        {isLiked ? '❤️' : '🤍'} <span className="text-sm">{likes}</span>
      </button>
      <button
        onClick={() => setIsCommentsVisible(prev => !prev)}
        className="text-sm text-light/60 hover:text-accent"
      >
        💬 {localCommentCount} Comment{localCommentCount !== 1 ? 's' : ''}
      </button>
    </div>

    {/* Comment Section */}
    {isCommentsVisible && (
      <div className="space-y-4 mt-4">
        {/* Add comment */}
        {user && (
          <div ref={commentFormRef} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-glass/5 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-sm text-light"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitComment()
                }
              }}
            />
            <button
              onClick={() => submitComment()}
              disabled={isSubmittingComment || !newComment.trim()}
              className="bg-accent/20 text-accent px-4 py-2 rounded-xl hover:bg-accent/30 disabled:opacity-50 text-sm"
            >
              {isSubmittingComment ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        )}

        {/* Comments Tree */}
        <div className="space-y-3">
          {comments.map(comment => renderComment(comment))}
        </div>
      </div>
    )}
  </div>
)

}