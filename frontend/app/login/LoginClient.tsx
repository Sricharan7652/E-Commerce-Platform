'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginClient() {
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
          // Store user session with consistent keys
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', 'dummy-token-' + Date.now());
          
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('userLoggedIn'));
          
          // Redirect to intended page or home
          const redirectTo = searchParams?.get('redirect') || '/';
          router.push(redirectTo);
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Register: Save user to localStorage
        const usersData = localStorage.getItem('users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        // Check if user already exists
        if (users.find((u: any) => u.email === formData.email)) {
          setError('User with this email already exists');
          setLoading(false);
          return;
        }

        // Create new user
        const newUser = {
          id: 'user-' + Date.now(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login after registration
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('userLoggedIn'));
        
        const redirectTo = searchParams?.get('redirect') || '/';
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-normal mb-6">
          {isLogin ? 'Sign in' : 'Create account'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md py-2 text-sm font-medium shadow-sm border border-yellow-600 transition-all duration-200 active:scale-95"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-blue-600 hover:text-orange-600 hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:text-orange-600 hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
