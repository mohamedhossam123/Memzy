// Posts/Page.tsx
'use client'
import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import PostForm from '@/Components/PostsFormComponent'
import PostFeed from '@/Components/PostFeedComponent'

export default function PostsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Floating Create Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 z-50 bg-glass rounded-xl p-5 shadow-2xl transition hover:scale-105 hover:shadow-glow group"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">➕</span>
            <span className="text-light/90 hidden md:block">Create Post</span>
          </div>
        </button>

        {/* Posts Feed Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-glow">Community Posts</h2>
          <div className="border-t border-glass/50 w-1/3 mx-auto my-6" />
        </div>

        {/* Grid Layout */}
        <PostFeed />

        {/* Create Post Modal */}
        <Transition appear show={showForm} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setShowForm(false)}
          >
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
                <div className="fixed inset-0 bg-black" aria-hidden="true" />
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
                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.95)] backdrop-blur-2xl rounded-2xl shadow-2xl transform transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                      Create New Post
                    </Dialog.Title>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-light/50 hover:text-light/80 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <PostForm onSuccess={() => setShowForm(false)} />
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  )
}