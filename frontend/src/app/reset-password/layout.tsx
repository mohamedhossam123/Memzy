// src/app/reset-password/layout.tsx
import React from 'react';
import { AuthProvider } from '@/Context/AuthContext'
export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <AuthProvider>
      {children}
      </AuthProvider>
    </>
  );
}