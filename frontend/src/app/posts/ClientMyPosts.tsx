// app/posts/ClientMyPosts.tsx

"use client";

import { useState, useEffect } from 'react';
import { MyPostsComponent } from '../../Components/MyPostsComponent'; 

interface HumorType {
  id: number;
  name: string;
}

export default function MyPostsContent() {
  // Track whether the component is mounted to handle safe state updates
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state when component initializes
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Only render the component when mounted (client-side)
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* This component handles fetching and displaying the user's posts */}
      <MyPostsComponent />
    </>
  );
}