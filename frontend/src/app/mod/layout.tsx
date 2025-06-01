// src/app/mod/layout.tsx
import { AuthProvider } from '@/Context/AuthContext';
import React from 'react';

export default function ModLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <AuthProvider>
          {children}
          </AuthProvider>
    </>
  );
}