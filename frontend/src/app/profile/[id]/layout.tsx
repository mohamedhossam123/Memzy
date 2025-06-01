// src/app/profile/[id]/layout.tsx
import { AuthProvider } from '@/Context/AuthContext';
import React from 'react';

export default function ProfileIdLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <AuthProvider>
      {children}
      </AuthProvider>
    </>
  );
}