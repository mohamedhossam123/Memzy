// Components/CreatePostsForm.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation'; 

interface HumorType {
  id: number;
  name: string;
}

interface CreatePostFormProps {
  humorTypes: HumorType[];
}

export function CreatePostForm({ humorTypes }: CreatePostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    humorTypeIds: [] as number[],
    file: null as File | null,
    filePreview: '',
  });

  // Handle file dropping functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData(prev => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file)
      }));
    }
  }, []);

  // Setup drag and drop functionality with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  });

  // Handle humor type checkbox changes
  const handleHumorTypeChange = (id: number) => {
    setFormData(prev => ({
      ...prev,
      humorTypeIds: prev.humorTypeIds.includes(id)
        ? prev.humorTypeIds.filter(hId => hId !== id)
        : [...prev.humorTypeIds, id]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate form inputs
    if (!formData.file || formData.humorTypeIds.length === 0) {
      setError('Please select a file and at least one humor type');
      setIsSubmitting(false);
      return;
    }

    // Prepare form data for submission
    const formPayload = new FormData();
    formPayload.append('Description', formData.description);
    formData.humorTypeIds.forEach(id => formPayload.append('HumorTypeIds', id.toString()));
    
    // Determine if it's an image or video and add appropriate file
    const isImage = formData.file.type.startsWith('image');
    formPayload.append(isImage ? 'ImageFile' : 'VideoFile', formData.file);

    try {
      // Send to the appropriate API endpoint based on file type
      const response = await fetch(`/api/posting/${isImage ? 'image' : 'video'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formPayload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Redirect to the post detail page
      const id = isImage ? result.imageId : result.videoId;
      router.push(`/posts/${isImage ? 'images' : 'videos'}/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      if (formData.filePreview) {
        URL.revokeObjectURL(formData.filePreview);
      }
    };
  }, [formData.filePreview]);

  // Handle navigation to my posts page
  const handleViewMyPosts = () => {
    router.push('/posts/my-posts');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-glow">Create New Post</h1>
        <button
          type="button"
          onClick={handleViewMyPosts}
          className="px-4 py-2 rounded-lg bg-glass hover:bg-glass/80 transition-colors"
        >
          View My Posts
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File drop zone for uploading images/videos */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-accent bg-primary/20' : 'border-glass'}`}
        >
          <input {...getInputProps()} />
          
          {formData.file ? (
            <div className="space-y-4">
              {formData.file.type.startsWith('image') ? (
                <img 
                  src={formData.filePreview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg object-cover"
                />
              ) : (
                <div className="bg-primary/20 p-4 rounded-lg">
                  <span className="text-accent">Video File:</span>
                  <p className="text-light/80">{formData.file.name}</p>
                </div>
              )}
              <p className="text-light/80">Click to change file</p>
            </div>
          ) : (
            <p className="text-light/80">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
            </p>
          )}
        </div>

        {/* Description textarea */}
        <div>
          <label className="block text-light/80 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 bg-glass rounded-lg focus:ring-2 focus:ring-accent outline-none"
            rows={3}
            maxLength={500}
            placeholder="Add a description for your post"
          />
        </div>

        {/* Humor types selection */}
        <div>
          <label className="block text-light/80 mb-2">Select Humor Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {humorTypes.map((humor) => (
              <label
                key={humor.id}
                className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors
                  ${formData.humorTypeIds.includes(humor.id)
                    ? 'bg-accent/20 border border-accent'
                    : 'bg-glass hover:bg-glass/80'}`}
              >
                <input
                  type="checkbox"
                  checked={formData.humorTypeIds.includes(humor.id)}
                  onChange={() => handleHumorTypeChange(humor.id)}
                  className="hidden"
                />
                <span className="text-light/90">{humor.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error message display */}
        {error && <p className="text-red-400">{error}</p>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-semibold transition-all
            ${isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90'}`}
        >
          {isSubmitting ? 'Uploading...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}