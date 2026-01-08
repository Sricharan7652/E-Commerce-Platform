'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login: Check if user exists in localStorage
        const usersData = localStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        const user = users.find((u: any) => 
          u.email === formData.email && u.password === formData.password
        );

        if (user) {
          // Generate a simple token (in production, use proper JWT)
          const token = `token-${Date.now()}-${Math.random()}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          const redirect = searchParams.get('redirect') || '/';
          window.location.href = redirect;
        } else {
          setError('Invalid email or password. Please try again.');
          setLoading(false);
        }
      } else {
        // Register: Save user to localStorage
        if (!formData.name || !formData.email || !formData.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const usersData = localStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        // Check if user already exists
        const existingUser = users.find((u: any) => u.email === formData.email);
        if (existingUser) {
          setError('An account with this email already exists. Please sign in instead.');
          setLoading(false);
          return;
        }

        // Create new user
        const newUser = {
          _id: `user-${Date.now()}-${Math.random()}`,
          name: formData.name,
          email: formData.email,
          password: formData.password, // In production, hash this
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Generate token and sign in
        const token = `token-${Date.now()}-${Math.random()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));

        const redirect = searchParams.get('redirect') || '/';
        window.location.href = redirect;
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      console.error('Login/Register error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tighter text-gray-900 mb-4">
            amazon<span className="text-sm text-gray-600">.com</span>
          </Link>
        </div>
        
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-normal mb-4">
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-400 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email (phone for mobile accounts)
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-400 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full border border-gray-400 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {!isLogin && (
                <p className="text-xs text-gray-600 mt-1">
                  Passwords must be at least 6 characters.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium shadow-sm border border-yellow-600"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create your Amazon account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-sm">
              <p className="text-gray-600">
                By continuing, you agree to Amazon's{' '}
                <Link href="#" className="text-blue-600 hover:underline hover:text-orange-600">
                  Conditions of Use
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-600 hover:underline hover:text-orange-600">
                  Privacy Notice
                </Link>
                .
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-xs text-gray-500 bg-white">New to Amazon?</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>

          {isLogin && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const redirect = searchParams.get('redirect') || '/';
                  window.location.href = redirect;
                }}
                className="w-full bg-white border border-gray-400 hover:bg-gray-50 rounded px-3 py-1.5 text-sm font-medium shadow-sm text-gray-700"
              >
                Continue as Guest
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="w-full text-left text-sm text-blue-600 hover:text-orange-600 hover:underline"
            >
              {isLogin ? 'Create your Amazon account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
