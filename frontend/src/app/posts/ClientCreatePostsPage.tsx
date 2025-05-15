// app/posts/ClientCreatePostsPage.tsx
"use client";

import { useEffect, useState } from 'react';
import { CreatePostForm } from '../../Components/CreatePostsForm';

interface HumorType {
  id: number;
  name: string;
}

export default function ClientCreatePostPage() {
  const [humorTypes, setHumorTypes] = useState<HumorType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHumorTypes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/humor-types');
        if (!response.ok) {
          throw new Error('Failed to fetch humor types');
        }
        const data = await response.json();
        setHumorTypes(data);
      } catch (error) {
        console.error('Failed to fetch humor types:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHumorTypes();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">Loading humor types...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-400">Error: {error}</div>;
  }

  return <CreatePostForm humorTypes={humorTypes} />;
}