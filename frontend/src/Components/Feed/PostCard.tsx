'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/Context/AuthContext'
import Link from 'next/link'

interface CommentResponseDto {
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
  profileImageUrl?: string | null;
  isLiked?: boolean 
  onLikeUpdate?: (postId: number, isLiked: boolean, likes: number) => void;
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
  authorId = "", 
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
  const [newComment, setNewComment] = useState("")
  const [isCommentsVisible, setIsCommentsVisible] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [localCommentCount, setLocalCommentCount] = useState(0)
  
  const { api, user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const commentFormRef = useRef<HTMLDivElement>(null)

  const fetchComments = useCallback(async () => {
    if (!user) return
    setIsLoadingComments(true)
    try {
      const res = await api.get(`/api/user/comments/GetComments?postId=${id}`)
      if (res && res.ok) {
        const data = await res.json()
        setComments(data)
        setLocalCommentCount(data.length)
      } else {
        console.error("Failed to fetch comments")
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    } finally {
      setIsLoadingComments(false)
    }
  }, [api, id, user])

  const submitComment = async () => {
    if (!newComment.trim() || isSubmittingComment || !user) return

    setIsSubmittingComment(true)
    try {
      const res = await api.post("/api/user/comments/addComment", {
        postId: id,
        content: newComment.trim(),
      })
      

      if (res && res.ok) {
        const data = await res.json()
        const newCommentObj: CommentResponseDto = {
          commentId: Date.now(),
          postId: id,
          userId: user.userId,
          userName: user.userName ?? "Unknown",
          userProfilePicture: user.profilePictureUrl || null,
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLikedByCurrentUser: false
        }
        
        setComments(prev => [newCommentObj, ...prev])
        setNewComment("")
        setLocalCommentCount(prev => prev + 1)
      } else {
        console.error("Failed to post comment")
      }
    } catch (err) {
      console.error("Error posting comment:", err)
    } finally {
      setIsSubmittingComment(false)
    }
  }
  const toggleCommentLike = async (commentId: number) => {
    if (!user) return
    try {
      const res = await api.post("/api/user/comments/ToggleLikeComments", {
        commentId
      })

      if (res && res.ok) {
        const data = await res.json() 
        setComments(prev => prev.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              likeCount: comment.isLikedByCurrentUser 
                ? comment.likeCount - 1 
                : comment.likeCount + 1,
              isLikedByCurrentUser: !comment.isLikedByCurrentUser
            }
          }
          return comment
        }))
      } else {
        console.error("Failed to toggle comment like")
      }
    } catch (err) {
      console.error("Error toggling comment like:", err)
    }
  }
  const deleteComment = async (commentId: number) => {
    if (!user) return
    try {
      const res = await api.delete("/api/user/comments/deleteComment", {
        body: JSON.stringify({ commentId })
      })

      if (res && res.ok) {
        setComments(prev => prev.filter(c => c.commentId !== commentId))
        setLocalCommentCount(prev => prev - 1)
      } else {
        console.error("Failed to delete comment")
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
    }
  }

  useEffect(() => {
  const fetchCommentCount = async () => {
    try {
      const res = await api.get(`/api/user/comments/GetCommentCount?postId=${id}`);
      if (res && res.ok) {
        const data = await res.json();
        setLocalCommentCount(data);
      }
    } catch (err) {
      console.error("Error fetching comment count:", err);
    }
  };

  if (user) {
    fetchCommentCount();
  }
}, [api, id, user]);

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
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Posts/${id}/like`
      const response = newIsLiked 
        ? await api.post(endpoint, {})
        : await api.delete(endpoint)
      if (!response || !response.ok) {
        setIsLiked(!newIsLiked)
        setLikes(newIsLiked ? likes : likes + 1)
        throw new Error('Failed to update like status')
      }
      const data = await response.json().catch(() => null)
      if (data) {
        setLikes(data.likeCount || newLikes)
        setIsLiked(data.isLiked !== undefined ? data.isLiked : newIsLiked)
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
    console.log('PostCard Props Debug:', {
      id,
      author,
      authorName,
      authorId,
      profileImageUrl
    });
  }, [id, author, authorName, authorId, profileImageUrl]);

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const observer = new IntersectionObserver(
      (entries) => {
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
        threshold: 0.5 
      }
    )
    observer.observe(videoElement)
    return () => {
      observer.disconnect()
    }
  }, [])

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
            <Link href={`/profile/${authorId}`} className="text-base text-glow font-semibold hover:underline">
              {authorName || author} 
            </Link>
            <Link href={`/profile/${authorId}`} className="text-sm text-light/60 hover:underline">
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
            onLoadedMetadata={(e) => {
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
            {localCommentCount} {localCommentCount === 1 ? 'comment' : 'comments'}
          </span>
        </button>
      </div>
      
      {/* Comments Section */}
      {isCommentsVisible && (
        <div className="pt-4 border-t border-glass/20">
          {/* Comment Form */}
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
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-glass/5 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent"
                  disabled={isSubmittingComment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitComment()
                    }
                  }}
                />
                <button
                  onClick={submitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="bg-accent/20 text-accent px-4 py-2 rounded-xl hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mx-2"></div>
                  ) : 'Post'}
                </button>
              </div>
            </div>
          )}
          
          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-light/50 py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.commentId} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {comment.userProfilePicture ? (
                      <img
                        src={comment.userProfilePicture}
                        alt={`${comment.userName}'s profile`}
                        className="w-9 h-9 rounded-full object-cover border border-glass"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-glass flex items-center justify-center text-sm text-light/60 border border-glass">
                        👤
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-glass/5 backdrop-blur-lg rounded-2xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/profile/${comment.userId}`} className="font-semibold hover:underline">
                            {comment.userName}
                          </Link>
                          <p className="text-light/90 mt-1">{comment.content}</p>
                        </div>
                        
                        {user?.userId === comment.userId && (
                          <button 
                            onClick={() => deleteComment(comment.commentId)}
                            className="text-light/50 hover:text-red-400 transition-colors"
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-4 text-sm text-light/60 pl-2">
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      <button 
                        onClick={() => toggleCommentLike(comment.commentId)}
                        className={`hover:text-accent transition-colors ${
                          comment.isLikedByCurrentUser ? 'text-accent' : ''
                        }`}
                        disabled={!user}
                      >
                        {comment.isLikedByCurrentUser ? '❤️' : '🤍'} {comment.likeCount}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}