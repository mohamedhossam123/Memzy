"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation'; // Note: using next/navigation instead of next/router

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  });

  const handleHumorTypeChange = (id: number) => {
    setFormData(prev => ({
      ...prev,
      humorTypeIds: prev.humorTypeIds.includes(id)
        ? prev.humorTypeIds.filter(hId => hId !== id)
        : [...prev.humorTypeIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.file || formData.humorTypeIds.length === 0) {
      setError('Please select a file and at least one humor type');
      setIsSubmitting(false);
      return;
    }

    const formPayload = new FormData();
    formPayload.append('Description', formData.description);
    formData.humorTypeIds.forEach(id => formPayload.append('HumorTypeIds', id.toString()));
    formPayload.append(formData.file.type.startsWith('image') ? 'ImageFile' : 'VideoFile', formData.file);

    try {
      const response = await fetch(`/api/posting/${formData.file.type.startsWith('image') ? 'image' : 'video'}`, {
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
      router.push(`/posts/${formData.file?.type.startsWith('image') ? 'images' : 'videos'}/${result.imageId || result.videoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (formData.filePreview) {
        URL.revokeObjectURL(formData.filePreview);
      }
    };
  }, [formData.filePreview]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-glow">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label className="block text-light/80 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 bg-glass rounded-lg focus:ring-2 focus:ring-accent outline-none"
            rows={3}
            maxLength={500}
          />
        </div>

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

        {error && <p className="text-red-400">{error}</p>}

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