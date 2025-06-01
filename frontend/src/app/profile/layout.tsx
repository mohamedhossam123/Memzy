// src/app/profile/layout.tsx
import { AuthProvider } from '@/Context/AuthContext';
import React from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <><AuthProvider>
      {children}
      </AuthProvider>
    </>
  );
}