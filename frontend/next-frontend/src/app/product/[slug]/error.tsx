"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center px-4 py-10 max-w-md">
        <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-8">
          We couldn't load the product information you requested. This could be due to a temporary issue or the product may no longer be available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-neon-pink hover:bg-neon-red text-white font-bold py-3 px-6 rounded-lg"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}