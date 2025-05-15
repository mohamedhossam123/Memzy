// import PostForm from '@/Components/PostsFormComponent';
import PostFeed from '@/Components/PostFeedComponent';

export default function PostsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
      {/* <PostForm /> */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Latest Posts</h2>
      <PostFeed />
    </div>
  );
}
