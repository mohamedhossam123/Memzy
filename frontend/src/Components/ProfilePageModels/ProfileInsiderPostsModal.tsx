// components/PostsModal.tsx
'use client'

import { Transition, Dialog } from '@headlessui/react'
import { Fragment, useState, useRef, useEffect } from 'react' 
import { Post } from '@/Components/ProfilePageModels/ProfilePostsComponent' 

interface PostsModalProps {
  isOpen: boolean
  onClose: () => void
  pendingPosts: Post[]
  approvedPosts: Post[]
  onApprove?: (postId: number) => void
  onReject?: (postId: number) => void
}

type PostTab = 'pending' | 'approved';
const postTabs: PostTab[] = ['pending', 'approved'];

export default function PostsModal({
  isOpen,
  onClose,
  pendingPosts,
  approvedPosts,
  onApprove,
  onReject
}: PostsModalProps) {
  const [activeTab, setActiveTab] = useState<typeof postTabs[number]>('pending')

  const getOptimizedMediaUrl = (url: string, type: 'image' | 'video') => {
    if (!url.includes('cloudinary.com')) return url
    
    if (type === 'image') {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/')
    } else if (type === 'video') {
      return url.replace('/upload/', '/upload/q_auto,w_800,c_limit/')
    }
    
    return url
  }
  const VideoPreview = ({ post }: { post: Post }) => {
    const [videoError, setVideoError] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleVideoEnd = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (videoRef.current) {
              if (entry.isIntersecting) {
                videoRef.current.play().catch(() => {
                })
              } else {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
              }
            }
          })
        },
        { threshold: 0.5 }
      )

      if (videoRef.current) {
        observer.observe(videoRef.current)
      }

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current)
        }
      }
    }, [])

    if (videoError) {
      return (
        <div className="w-24 h-24 bg-glass/5 rounded-lg border border-red-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">🎥</div>
            <p className="text-red-400 text-xs">Failed</p>
          </div>
        </div>
      )
    }

    if (!post.filePath) {
      return (
        <div className="w-24 h-24 bg-glass/5 rounded-lg border border-gray-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">🎥</div>
            <p className="text-gray-400 text-xs">No video</p>
          </div>
        </div>
      )
    }

    return (
      <video
        ref={videoRef}
        className="w-24 h-24 object-cover rounded-lg"
        muted
        playsInline
        preload="metadata"
        controls={false}
        onEnded={handleVideoEnd}
        onError={() => setVideoError(true)}
        onClick={(e) => e.preventDefault()} 
      >
        <source src={getOptimizedMediaUrl(post.filePath || '', 'video')} type="video/mp4" />
      </video>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="ease-in duration-200"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
          </Transition.Child>
          
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                  Posts
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-light/50 hover:text-light/80 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4">
                {postTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white'
                        : 'bg-[rgba(255,255,255,0.05)] text-light/80 hover:bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    {tab === 'pending' ? 'Pending Posts' : 'Approved Posts'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="max-h-[60vh] overflow-y-auto space-y-4">
                {(activeTab === 'pending' ? pendingPosts : approvedPosts).map(post => (
                  <div key={post.postId} className="p-4 bg-glass/10 rounded-lg">
                    <div className="flex gap-4">
                      {/* Media Preview */}
                      {post.filePath && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {post.mediaType === 'Video' ? (
                            <VideoPreview post={post} />
                          ) : (
                            <img
                              src={getOptimizedMediaUrl(post.filePath, 'image')}
                              alt="Post preview"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Post Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-light/60">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.isApproved 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {post.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        
                        <p className="text-light/90 text-sm line-clamp-2 mb-2">
                          {post.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {post.postHumors?.map?.((humor: { humorType: { name: string } }, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-glass/20"
                            >
                              {humor.humorType?.name ?? 'Unknown'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    {!post.isApproved && onApprove && onReject && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => onApprove(post.postId)}
                          className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(post.postId)}
                          className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {(activeTab === 'pending' && pendingPosts.length === 0) && (
                  <p className="text-center text-light/60">No pending posts</p>
                )}
                
                {(activeTab === 'approved' && approvedPosts.length === 0) && (
                  <p className="text-center text-light/60">No approved posts yet</p>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}