import { useState } from 'react';
import { Lock, User, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { shopInfo } from '../data/paintTypes';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const online = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Shop Info */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 mx-auto mb-4 bg-white rounded-full shadow-xl flex items-center justify-center p-2 border-4 border-blue-200">
            <img src="/logo.png" alt="Ziad Qaisrani Traders" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{shopInfo.name}</h1>
          <p className="text-blue-200 text-sm">{shopInfo.address}</p>
          <p className="text-blue-200 text-sm">📞 {shopInfo.phone}</p>
          {/* Online indicator */}
          <div className="mt-3 inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
            {online ? (
              <><Wifi className="w-3.5 h-3.5 text-green-300" /><span className="text-xs text-green-200">Connected (Online Mode)</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-yellow-300" /><span className="text-xs text-yellow-200">Offline Mode (Local)</span></>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Login to Continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Login'}
            </button>
          </form>

          {/* Default creds hint */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p><strong>Manager:</strong> manager / manager123</p>
            <p><strong>Editor:</strong> editor / editor123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
