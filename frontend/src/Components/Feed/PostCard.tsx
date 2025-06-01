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

    // Optimistic deletion using the recursive helper
    setComments(prev => UpdateSubComments(prev, commentId, () => null))
    setLocalCommentCount(prev => prev - 1)

    try {
      const response = await deleteCommentApi(api, {
        commentId,
        userId: user.userId,
      })
      if (!response.data) {
        console.error('Failed to delete comment:', response.error)
        // Revert: Re-fetch comments to sync state with backend
        fetchComments()
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      // Revert: Re-fetch comments to sync state with backend
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
      <div key={comment.commentId} className={`bg-glass/20 p-3 rounded-xl border border-glass ${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className="flex items-center gap-3">
          {comment.userProfilePicture ? (
            <img
              src={comment.userProfilePicture}
              alt={`${comment.userName}'s profile`}
              className="w-8 h-8 rounded-full object-cover border border-glass"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center text-xs text-light/60 border border-glass">
              👤
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{comment.userName}</p>
            <p className="text-xs text-light/60">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <p className="mt-2 text-light/90 whitespace-pre-line">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => toggleCommentLike(comment.commentId)}
            className={`text-lg transition-colors ${
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
              onClick={() => deleteComment(comment.commentId)} // No need to pass parentCommentId here
              className="text-red-400 hover:text-red-500 text-sm ml-auto"
              title="Delete comment"
            >
              🗑️ Delete
            </button>
          )}
          {user && (
            <button
              onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}
              className="text-light/60 hover:text-light text-sm"
            >
              💬 Reply
            </button>
          )}
        </div>

        {replyingToCommentId === comment.commentId && user && (
          <div className="flex gap-2 mt-3 pl-8">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.userName}...`}
              className="flex-1 bg-glass/5 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-sm"
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
              className="bg-accent/20 text-accent px-3 py-1 rounded-xl hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmittingComment ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mx-1"></div>
              ) : (
                'Reply'
              )}
            </button>
            <button
              onClick={() => setReplyingToCommentId(null)}
              className="bg-red-400/20 text-red-400 px-3 py-1 rounded-xl hover:bg-red-400/30 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Render Replies Section with Toggle */}
        {hasReplies && (
          <div className="mt-2">
            <button
              onClick={() => toggleRepliesCollapse(comment.commentId)}
              className="text-light/60 hover:text-accent text-sm flex items-center"
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
              <div className="mt-2 space-y-2">
                {comment.replies!.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow hover:shadow-glow/50 transition-all space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${author}'s profile`}
              className="w-9 h-9 rounded-full object-cover border border-glass"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-glass flex items-center justify-center text-sm text-light/60 border border-glass">
              👤
            </div>
          )}

          <div className="flex flex-col">
            <Link
              href={`/profile/${authorId}`}
              className="text-base text-glow font-semibold hover:underline"
            >
              {authorName || author}
            </Link>
            <Link
              href={`/profile/${authorId}`}
              className="text-sm text-light/60 hover:underline"
            >
              @{author}
            </Link>
          </div>
        </div>

        <p className="text-sm text-light/50">{timestamp}</p>
      </div>

      {/* Content */}
      <p className="text-light/90 whitespace-pre-line">{content}</p>

      {/* Media */}
      {mediaType === 'image' && mediaUrl && !imageError && (
        <div className="-mx-6">
          <div className="relative">
            {!imageLoaded && (
              <div className="w-full h-64 bg-glass/5 rounded-xl border border-glass flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            )}
            <img
              src={getOptimizedMediaUrl(mediaUrl, 'image')}
              alt="Post media"
              className={`w-full object-cover rounded-none border-y border-glass transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                console.error('Failed to load image:', mediaUrl)
              }}
              loading="lazy"
            />
          </div>
        </div>
      )}

      {mediaType === 'video' && mediaUrl && !videoError && (
        <div className="-mx-6 relative">
          <video
            ref={videoRef}
            controls
            className="w-full h-auto max-h-[800px] rounded-none border-y border-glass"
            preload="auto"
            playsInline
            onLoadedMetadata={e => {
              const video = e.currentTarget
              const aspectRatio = video.videoWidth / video.videoHeight
              video.style.aspectRatio = aspectRatio.toString()
            }}
            onEnded={handleVideoEnd}
            onError={() => {
              setVideoError(true)
              console.error('Failed to load video:', mediaUrl)
            }}
          >
            <source src={getOptimizedMediaUrl(mediaUrl, 'video')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Media Error States */}
      {imageError && mediaType === 'image' && (
        <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-red-400 text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {videoError && mediaType === 'video' && (
        <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🎥</div>
            <p className="text-red-400 text-sm">Video failed to load</p>
          </div>
        </div>
      )}

      {/* Humor Type Tag */}
      <div className="flex justify-start">
        <span
          className={`px-3 py-1 text-sm rounded-full font-medium bg-glass/20 backdrop-blur-md border ${
            humorType === 'Dark Humor'
              ? 'text-red-400 border-red-400/30'
              : 'text-green-300 border-green-300/30'
          }`}
        >
          {humorType}
        </span>
      </div>

      {/* Like and Comment Counter */}
      <div className="flex items-center gap-4 pt-2 border-t border-glass/30">
        <button
          className={`transition-all duration-200 text-xl ${
            isLiked
              ? 'text-accent scale-110 hover:scale-105'
              : 'text-light/50 hover:text-accent hover:scale-105'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            !user ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleLikeToggle}
          disabled={isLikeLoading || !user}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
          title={!user ? 'Login to like posts' : undefined}
        >
          {isLikeLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
          ) : (
            '😂'
          )}
        </button>
        <span className="text-light/70 min-w-[50px]">
          {likes} {likes === 1 ? 'like' : 'likes'}
        </span>

        {/* Comments Toggle */}
        <button
          onClick={() => setIsCommentsVisible(!isCommentsVisible)}
          className={`flex items-center gap-2 transition-colors ${
            !user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-accent'
          }`}
          disabled={!user}
          title={!user ? 'Login to comment' : undefined}
        >
          <span className="text-xl">💬</span>
          <span className="text-light/70">
            {localCommentCount}{' '}
            {localCommentCount === 1 ? 'comment' : 'comments'}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {isCommentsVisible && (
        <div className="pt-4 border-t border-glass/20">
          {/* Main Comment Form */}
          {user && (
            <div ref={commentFormRef} className="flex gap-3 mb-4">
              <div className="flex-shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.userName}'s profile`}
                    className="w-9 h-9 rounded-full object-cover border border-glass"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-glass flex items-center justify-center text-sm text-light/60 border border-glass">
                    👤
                  </div>
                )}
              </div>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-glass/5 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent"
                  disabled={isSubmittingComment}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitComment()
                    }
                  }}
                />
                <button
                  onClick={() => submitComment()}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="bg-accent/20 text-accent px-4 py-2 rounded-xl hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mx-2"></div>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => renderComment(comment))}
            </div>
          ) : (
            <p className="text-center text-light/50 py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  )
}