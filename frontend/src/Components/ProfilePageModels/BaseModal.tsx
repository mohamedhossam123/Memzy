'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const BaseModal = ({ isOpen, onClose, title, children }: BaseModalProps) => (
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
          <div className="fixed inset-0 bg-black" aria-hidden="true" />
        </Transition.Child>
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                {title}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-light/50 hover:text-light/80 transition-colors"
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)