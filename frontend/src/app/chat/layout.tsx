// src/app/chat/layout.tsx
import { AuthProvider } from '@/Context/AuthContext';
import React from 'react';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <AuthProvider>
      {children}
      </AuthProvider>
    </>
  );
}