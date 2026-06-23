import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-stone-300 dark:text-stone-700">404</h1>
      <p className="text-stone-500 dark:text-stone-400 mt-2">Page not found.</p>
      <Link to="/" className="text-brand-600 font-medium mt-4">Go home</Link>
    </div>
  );
}
