// src/app/login/layout.tsx
import { AuthProvider } from '@/Context/AuthContext';
import React from 'react';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <AuthProvider>
      {children}
      </AuthProvider>
    </>
  );
}