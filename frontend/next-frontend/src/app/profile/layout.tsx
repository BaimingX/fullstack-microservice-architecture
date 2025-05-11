"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 检查用户是否已登录
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // 如果未登录，重定向到登录页面
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/profile');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
        
      </div>
      {children}
    </div>
  );
} 