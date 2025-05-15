// Components/MyPostsComponent.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define interfaces for our post types
interface PostBase {
  id: number;
  description: string;
  filePath: string;
  contentType: string;
  createdAt: string;
  isApproved: boolean;
  humorTypes: string[];
  likeCounter: number;
}

interface ImagePost extends PostBase {
  imageId: number;
  type: 'image';
}

interface VideoPost extends PostBase {
  videoId: number;
  type: 'video';
}

type Post = ImagePost | VideoPost;

export default function MyPostsComponent() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');

  // Fetch both image and video posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Fetch images and videos in parallel
        const [imagesResponse, videosResponse] = await Promise.all([
          fetch('/api/user/images', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('/api/user/videos', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (!imagesResponse.ok || !videosResponse.ok) {
          throw new Error('Failed to fetch posts');
        }

        // Parse the responses
        const imagesData = await imagesResponse.json();
        const videosData = await videosResponse.json();

        // Transform and combine the data
        const imagePosts: ImagePost[] = imagesData.map((img: any) => ({
          id: img.imageId,
          imageId: img.imageId,
          type: 'image',
          description: img.description,
          filePath: img.filePath,
          contentType: img.contentType,
          createdAt: img.createdAt,
          isApproved: img.isApproved,
          humorTypes: img.imageHumors?.map((h: any) => h.humorType.name) || [],
          likeCounter: img.imageLikeCounter
        }));

        const videoPosts: VideoPost[] = videosData.map((vid: any) => ({
          id: vid.videoId,
          videoId: vid.videoId,
          type: 'video',
          description: vid.description,
          filePath: vid.filePath,
          contentType: vid.contentType,
          createdAt: vid.createdAt,
          isApproved: vid.isApproved,
          humorTypes: vid.videoHumors?.map((h: any) => h.humorType.name) || [],
          likeCounter: vid.videoLikeCounter
        }));

        // Combine and sort by creation date (newest first)
        const allPosts = [...imagePosts, ...videoPosts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setPosts(allPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on the active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approved') return post.isApproved;
    if (activeTab === 'pending') return !post.isApproved;
    return true;
  });

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle clicking on a post to navigate to its detail page
  const handlePostClick = (post: Post) => {
    const route = post.type === 'image' 
      ? `/posts/images/${post.imageId}`
      : `/posts/videos/${post.videoId}`;
    router.push(route);
  };

  // Handle creating a new post
  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-light/80">Loading your posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400">Error: {error}</div>
        <button 
          onClick={handleCreatePost}
          className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
        >
          Create New Post
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-glow">My Posts</h1>
        <button 
          onClick={handleCreatePost}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 transition-colors"
        >
          Create New Post
        </button>
      </div>

      {/* Tabs for filtering */}
      <div className="flex space-x-4 mb-6 border-b border-glass pb-2">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'all' ? 'bg-accent/20 text-accent' : 'text-light/70 hover:text-light'
          }`}
        >
          All Posts ({posts.length})
        </button>
        <button 
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'approved' ? 'bg-green-500/20 text-green-400' : 'text-light/70 hover:text-light'
          }`}
        >
          Approved ({posts.filter(p => p.isApproved).length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'text-light/70 hover:text-light'
          }`}
        >
          Pending Approval ({posts.filter(p => !p.isApproved).length})
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-glass rounded-xl p-8">
          <p className="text-light/80">
            {activeTab === 'all' 
              ? "You haven't created any posts yet." 
              : activeTab === 'approved' 
                ? "You don't have any approved posts yet."
                : "You don't have any pending posts."
            }
          </p>
          {activeTab !== 'approved' && (
            <button 
              onClick={handleCreatePost}
              className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
            >
              Create Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={`${post.type}-${post.id}`}
              onClick={() => handlePostClick(post)}
              className="bg-glass rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all"
            >
              {/* Post preview */}
              <div className="h-48 bg-primary/20 flex items-center justify-center">
                {post.type === 'image' ? (
                  <img 
                    src={`/${post.filePath}`} 
                    alt={post.description} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-light/70 mt-2">Video</span>
                  </div>
                )}
              </div>
              
              {/* Post info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.isApproved 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="ml-2 text-light/50 text-sm">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-light/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{post.likeCounter}</span>
                  </div>
                </div>
                
                {post.description && (
                  <p className="text-light/80 mb-2 line-clamp-2">{post.description}</p>
                )}
                
                {post.humorTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.humorTypes.map((type, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-primary/20 rounded-full text-xs text-light/70"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}