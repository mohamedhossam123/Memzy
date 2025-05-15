// 'use client';

// import { useState } from 'react';
// import axios from 'axios';

// export default function PostForm() {
//   const [text, setText] = useState('');
//   const [humorType, setHumorType] = useState('Dark');
//   const [media, setMedia] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('text', text);
//     formData.append('humorType', humorType);
//     if (media) formData.append('media', media);

//     try {
//       setLoading(true);
//       await axios.post('/api/CreatePost', formData); // Proxy to your backend
//       setText('');
//       setMedia(null);
//       alert('Post created successfully!');
//     } catch (err) {
//       alert('Failed to create post');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 bg-[rgba(10,10,10,0.75)] backdrop-blur border border-[rgba(255,255,255,0.1)] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-6">
//       <textarea
//         className="w-full p-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#f5f5f5] placeholder-[#666] focus:outline-none focus:border-[#8e44ad] transition-colors"
//         placeholder="What's on your mind?"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         required
//       />
      
//       <select
//         value={humorType}
//         onChange={(e) => setHumorType(e.target.value)}
//         className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#8e44ad] appearance-none"
//       >
//         <option value="Dark">Dark Humor</option>
//         <option value="Friendly">Friendly Humor</option>
//       </select>

//       <div className="relative">
//         <label className="block w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors">
//           <span className="text-[#f5f5f5]">{media ? media.name : 'Upload Media'}</span>
//           <input 
//             type="file" 
//             accept="image/*,video/*" 
//             onChange={(e) => setMedia(e.target.files?.[0] || null)}
//             className="hidden"
//           />
//         </label>
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white py-3 rounded-lg font-semibold hover:from-[#9e44f0] hover:to-[#5a10e0] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {loading ? 'Posting...' : 'Post'}
//       </button>
//     </form>
//   );
// }