// components/PostCard

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

  const [, setImageLoaded] = useState(false)

  const [, setImageError] = useState(false)

  const [videoError, setVideoError] = useState(false)

  const [likes, setLikes] = useState(initialLikes)

  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const [isLikeLoading, setIsLikeLoading] = useState(false)



  const [comments, setComments] = useState<CommentResponseDto[]>([])

  const [newComment, setNewComment] = useState('')

  const [isCommentsVisible, setIsCommentsVisible] = useState(false)

  const [, setIsLoadingComments] = useState(false)

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

        return UpdateSubComments(prev, parentCommentId, (parent) => ({

          ...parent,

          replies: [...(parent.replies || []), optimisticComment],

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





  let originalComment: CommentResponseDto | null = null

  const findComment = (comments: CommentResponseDto[], id: number): CommentResponseDto | null => {

    for (const comment of comments) {

      if (comment.commentId === id) return comment

      if (comment.replies) {

        const found = findComment(comment.replies, id)

        if (found) return found

      }

    }

    return null

  }

  originalComment = findComment(comments, commentId)

  if (!originalComment) return

  console.log('Original comment before toggle:', originalComment)

  setComments(prevComments =>

    UpdateSubComments(prevComments, commentId, (comment) => {

      const updated = {

        ...comment,

        isLikedByCurrentUser: !comment.isLikedByCurrentUser,

        likeCount: comment.isLikedByCurrentUser ? comment.likeCount - 1 : comment.likeCount + 1,

      }

      console.log('Optimistic update:', { original: comment, updated })

      return updated

    })

  )



  try {

    const response = await toggleCommentLikeApi(api, commentId)

    console.log('API Response:', response)

    if (response.data) {

      console.log('Server data:', JSON.stringify(response.data, null, 2))

      setComments(prev =>

        UpdateSubComments(prev, commentId, (comment) => {

          const synced = {

            ...comment,

            likeCount: response.data!.likeCount,

            isLikedByCurrentUser: response.data!.isLiked,

          }

          return synced

        })

      )

    } else {

      console.error('Failed to toggle comment like:', response.error)

      setComments(prevComments =>

        UpdateSubComments(prevComments, commentId, () => {

          console.log('Reverting to original:', originalComment)

          return originalComment!

        })

      )

    }

  } catch (err) {

    console.error('Error toggling comment like:', err)

    setComments(prevComments =>

      UpdateSubComments(prevComments, commentId, () => {

        console.log('Reverting to original (catch):', originalComment)

        return originalComment!

      })

    )

  }

}



  const deleteComment = async (commentId: number) => {

    if (!user) return

    if (!window.confirm('Are you sure you want to delete this comment?')) return

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

        setLocalCommentCount(response.data.totalCount)

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

    if (isCommentsVisible && comments.length === 0 && localCommentCount > 0) {

      fetchComments()

    }

  }, [isCommentsVisible, comments.length, localCommentCount, fetchComments])



  useEffect(() => {

    if (isCommentsVisible && commentFormRef.current) {

      commentFormRef.current.scrollIntoView({ behavior: 'smooth' })

    }

  }, [isCommentsVisible, comments.length])



  const handleVideoEnd = () => {

    if (videoRef.current) {

      videoRef.current.currentTime = 0

      videoRef.current.play().catch(error => console.error("Error replaying video:", error));

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



    const originalIsLiked = isLiked

    const originalLikes = likes

    setIsLiked(!isLiked)

    setLikes(likes + (!isLiked ? 1 : -1))



    try {

      const response = await togglePostLike(api, id, originalIsLiked)

      if (response.data) {

        setLikes(response.data.likeCount)

        setIsLiked(response.data.isLiked)

      } else {

        setIsLiked(originalIsLiked)

        setLikes(originalLikes)

        console.error('Failed to update post like:', response.error)

      }

    } catch (error) {

      console.error('Error toggling post like:', error)

      setIsLiked(originalIsLiked)

      setLikes(originalLikes)

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

            if (videoElement.paused && videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {

              videoElement.play().catch(error => {

              });

            }

          } else {

            videoElement.pause()

          }

        })

      },

      { threshold: 0.5 }

    )

    observer.observe(videoElement)

    return () => {

      if (videoElement) {

        observer.unobserve(videoElement);

      }

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



  const renderComment = (comment: CommentResponseDto, isReply: boolean = false, depth: number = 0) => {

    const hasReplies = comment.replies && comment.replies.length > 0

    const areRepliesCollapsed = collapsedReplies.has(comment.commentId)

    const maxDepth = 5

    const isDeepNested = depth >= maxDepth



    return (

      <div

        key={comment.commentId}

        className={`relative ${isReply ? 'ml-4 sm:ml-8 mt-3' : ''} ${depth > 0 ? 'pl-4 border-l-2 border-accent/20' : ''} transition-all duration-200`}

      >

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-4 rounded-xl border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-200">

          <div className="flex items-start gap-3">

            <div className="flex-shrink-0">

              {comment.userProfilePicture ? (

                <img

                  src={comment.userProfilePicture}

                  alt={`${comment.userName}'s profile`}

                  className="w-10 h-10 rounded-full object-cover border-2 border-accent/30"

                />

              ) : (

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm text-gray-300 border border-gray-600">

                  <span className="text-lg">👤</span>

                </div>

              )}

            </div>



            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <p className="font-semibold text-gray-100 truncate">{comment.userName}</p>

                {/* Ensure authorId is a string for comparison if comment.userId could be number */}

                {String(comment.userId) === authorId && (

                  <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Author</span>

                )}

              </div>

              <p className="text-xs text-gray-400">

                {new Date(comment.createdAt).toLocaleString('en-US', {

                  month: 'short',

                  day: 'numeric',

                  hour: '2-digit',

                  minute: '2-digit'

                })}

              </p>

            </div>

          </div>



          <div className="mt-3">

            <p className="text-gray-100 whitespace-pre-line break-words">{comment.content}</p>

          </div>



          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">

            <div className="flex items-center gap-4">

              <button

                onClick={() => toggleCommentLike(comment.commentId)}

                className={`flex items-center gap-1 transition-colors ${

                  comment.isLikedByCurrentUser

                    ? 'text-red-400'

                    : 'text-gray-400 hover:text-red-400'

                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}

                disabled={!user}

                title={!user ? 'Login to like comments' : 'Like comment'}

              >

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={comment.isLikedByCurrentUser ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">

                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>

                </svg>

                <span className="text-sm">{comment.likeCount}</span>

              </button>



              {user && !isDeepNested && (

                <button

                  onClick={() => setReplyingToCommentId(replyingToCommentId === comment.commentId ? null : comment.commentId)}

                  className="flex items-center gap-1 text-gray-400 hover:text-accent transition-colors"

                  title="Reply to comment"

                >

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>

                  </svg>

                  <span className="text-sm">Reply</span>

                </button>

              )}

            </div>



            {user && user.userId === comment.userId && (

              <button

                onClick={() => deleteComment(comment.commentId)}

                className="text-red-400/80 hover:text-red-400 text-sm transition-colors flex items-center gap-1"

                title="Delete comment"

              >

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                  <path d="M3 6h18"/>

                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>

                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>

                </svg>

              </button>

            )}

          </div>



          {replyingToCommentId === comment.commentId && user && !isDeepNested && (

            <div className="mt-4 pt-3 border-t border-gray-700">

              <div className="flex gap-3">

                <div className="flex-shrink-0">

                  {user.profilePictureUrl ? (

                    <img

                      src={user.profilePictureUrl}

                      alt="Your profile"

                      className="w-8 h-8 rounded-full object-cover border border-accent/30"

                    />

                  ) : (

                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">

                      👤

                    </div>

                  )}

                </div>

                <div className="flex-1 flex flex-col gap-2">

                  <textarea

                    value={replyContent}

                    onChange={(e) => setReplyContent(e.target.value)}

                    placeholder={`Reply to ${comment.userName}...`}

                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 text-sm text-gray-100 placeholder-gray-500 resize-none"

                    rows={2}

                    disabled={isSubmittingComment}

                    onKeyDown={(e) => {

                      if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) { // Ctrl+Enter to submit

                        e.preventDefault()

                        submitComment(comment.commentId)

                      }

                    }}

                  />

                  <div className="flex justify-end gap-2">

                    <button

                      onClick={() => setReplyingToCommentId(null)}

                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-colors"

                    >

                      Cancel

                    </button>

                    <button

                      onClick={() => submitComment(comment.commentId)}

                      disabled={isSubmittingComment || !replyContent.trim()}

                      className="px-3 py-1.5 text-sm rounded-lg bg-accent/90 text-white hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"

                    >

                      {isSubmittingComment ? (

                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                        </svg>

                      ) : (

                        <>

                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                            <path d="m22 2-7 20-4-9-9-4Z"/>

                            <path d="M22 2 11 13"/>

                          </svg>

                          Reply

                        </>

                      )}

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>



        {hasReplies && (

          <div className="mt-3">

            <button

              onClick={() => toggleRepliesCollapse(comment.commentId)}

              className="flex items-center text-xs text-gray-400 hover:text-accent transition-colors mb-2 ml-2" // Added ml-2 for slight indent

            >

              {areRepliesCollapsed ? (

                <>

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="m9 18 6-6-6-6"/> {/* Right arrow for expand */}

                  </svg>

                  <span className="ml-1">

                    {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}

                  </span>

                </>

              ) : (

                <>

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="m6 9 6 6 6-6"/> {/* Down arrow for collapse (inverted logic from path usually) - or use chevron-up */}

                    {/* Corrected to chevron-down for "Hide replies" implies current state is expanded */}

                    {/* <path d="m18 15-6-6-6 6"/>  Chevron up would be more intuitive for "Hide" */}

                    <path d="m18 15-6-6-6 6"/> {/* This is chevron-up. If expanded, clicking this hides. */}

                  </svg>

                  <span className="ml-1">Hide replies</span>

                </>

              )}

            </button>



            {!areRepliesCollapsed && (

              <div className="space-y-3">

                {comment.replies!.map(reply => renderComment(reply, true, depth + 1))}

              </div>

            )}

          </div>

        )}

      </div>

    )

  }



  return (

    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl w-full max-w-2xl mx-auto backdrop-blur-sm">

      <div className="p-5">

        <div className="flex items-center gap-4">

          {profileImageUrl ? (

            <img src={profileImageUrl} alt={`${authorName || author}'s profile`} className="w-10 h-10 rounded-full object-cover border-2 border-accent/30" />

          ) : (

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm text-gray-300 border border-gray-600">

              <span className="text-lg">👤</span>

            </div>

          )}

          <div className="flex flex-col">

            <Link href={`/profile/${authorId}`} className="font-semibold hover:underline text-gray-100">{authorName || author}</Link>

            <span className="text-xs text-gray-400">{new Date(timestamp).toLocaleString()}</span>

          </div>

          <div className="ml-auto text-xs px-2 py-1 bg-glass/10 border border-gray-600 rounded-full text-gray-300">{humorType}</div>

        </div>



        <p className="text-gray-100 whitespace-pre-line mt-3">{content}</p>

      </div>



      {mediaType && mediaUrl && (

        <div className="w-full bg-black"> {/* Added bg-black for letterboxing if media aspect ratio differs */}

          {mediaType === 'image' ? (

            <img

              src={getOptimizedMediaUrl(mediaUrl, 'image')}

              alt="Post Media"

              className="w-full h-auto object-contain max-h-[80vh]" // Added h-auto, object-contain, max-h

              onLoad={() => setImageLoaded(true)}

              onError={() => setImageError(true)}

            />

          ) : (

            <div className="relative w-full">

              <video

                src={getOptimizedMediaUrl(mediaUrl, 'video')}

                controls

                // loop // Loop is handled by onEnded for continuous play if desired

                ref={videoRef}

                className="w-full h-auto max-h-[80vh]" // Consistent max height

                onError={() => setVideoError(true)}

                onEnded={handleVideoEnd} // Re-added for custom loop/replay logic

                playsInline

                preload="metadata" // Good default

              />

              {videoError && (

                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">

                  Failed to load video

                </div>

              )}

            </div>

          )}

        </div>

      )}



      <div className="p-5 border-t border-gray-700">

        <div className="flex items-center gap-6 text-gray-400">

          <button

            onClick={handleLikeToggle}

            className={`flex items-center gap-1.5 ${isLiked ? 'text-red-400' : 'hover:text-red-400'} transition-colors disabled:opacity-50`}

            disabled={isLikeLoading || !user}

            title={!user ? "Login to like post" : (isLiked ? "Unlike post" : "Like post")}

          >

            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">

              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>

            </svg>

            <span className="text-sm">{likes}</span>

          </button>



          <button

            onClick={() => setIsCommentsVisible(prev => !prev)}

            className="flex items-center gap-1.5 hover:text-accent transition-colors"

            title={isCommentsVisible ? "Hide comments" : "Show comments"}

          >

            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>

            </svg>

            <span className="text-sm">

              {localCommentCount} {localCommentCount === 1 ? 'Comment' : 'Comments'}

            </span>

          </button>

        </div>



        {isCommentsVisible && (

          <div className="mt-6">

            {user && (

              <div ref={commentFormRef} className="flex gap-3 mb-6">

                {user.profilePictureUrl ? (

                  <img

                    src={user.profilePictureUrl}

                    alt="Your profile"

                    className="w-10 h-10 rounded-full object-cover border-2 border-accent/30 flex-shrink-0"

                  />

                ) : (

                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-300 border border-gray-600 flex-shrink-0">

                    👤

                  </div>

                )}

                <div className="flex-1 flex flex-col gap-2">

                  <textarea

                    value={newComment}

                    onChange={(e) => setNewComment(e.target.value)}

                    placeholder="Share your thoughts... (Ctrl+Enter to post)"

                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 text-gray-100 placeholder-gray-500 resize-none"

                    rows={3}

                    onKeyDown={(e) => {

                      if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) { // Ctrl+Enter to submit

                        e.preventDefault()

                        submitComment()

                      }

                    }}

                  />

                  <div className="flex justify-end">

                    <button

                      onClick={() => submitComment()}

                      disabled={isSubmittingComment || !newComment.trim()}

                      className="px-4 py-2 rounded-lg bg-accent/90 text-white hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"

                    >

                      {isSubmittingComment ? (

                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                        </svg>

                      ) : (

                        <>

                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                            <path d="m22 2-7 20-4-9-9-4Z"/>

                            <path d="M22 2 11 13"/>

                          </svg>

                          Post

                        </>

                      )}

                    </button>

                  </div>

                </div>

              </div>

            )}



            <div className="space-y-4">

              {comments.length > 0 ? (

                comments.map(comment => renderComment(comment, false, 0))

              ) : (

                <div className="text-center py-6 text-gray-400">

                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2">

                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>

                  </svg>

                  <p>{ localCommentCount > 0 && comments.length === 0 ? "Loading comments..." : "No comments yet. Be the first to share your thoughts!"}</p>

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </div>

  )
}