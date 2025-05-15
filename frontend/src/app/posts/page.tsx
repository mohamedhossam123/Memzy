'use client';

import MyPostsContent from './ClientCreatePostsPage'; 

export default function MyPostsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">
      <MyPostsContent />
    </div>
  );
}
