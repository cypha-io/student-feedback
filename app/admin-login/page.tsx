'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../components/AuthProvider';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("https://olagshs.edu.gh/wp-content/uploads/2025/11/olag-shs-10.jpg")' }}
      />
      <div className="absolute inset-0 bg-black/40 z-[5]" />
      <div className="w-full max-w-md z-10">
        <form onSubmit={handleLogin} className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-auto space-y-6 relative">
          <div className="flex flex-col items-center space-y-2 mb-4">
            <div className="w-28 h-28 flex items-center justify-center bg-transparent">
              <Image src="https://olagshs.edu.gh/wp-content/uploads/2025/11/cropped-olag_logo3-1-1.png" alt="OLAG SHS Logo" width={112} height={112} className="object-contain" />
            </div>
            <p className="text-gray-600 text-center">Admin Portal - Sign in to dashboard</p>
            <p className="text-xs text-gray-500 text-center">Built by SwapGPA Technologies Limited | OLAGSHS Deployment</p>
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}
