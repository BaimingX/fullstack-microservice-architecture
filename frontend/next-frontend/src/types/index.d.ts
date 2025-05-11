// 解决模块声明问题
declare module 'react';
declare module 'next/link';
declare module 'next/image';
declare module 'lucide-react';
declare module 'framer-motion';
declare module 'next-auth/react';

// 添加JSX命名空间
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 