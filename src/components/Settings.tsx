import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Save, Check, X, LogOut, ArrowLeft } from 'lucide-react';
import { shopInfo } from '../data/paintTypes';

interface SettingsProps {
  currentUser: { username: string; password: string; role: string; name: string };
  onGoBack: () => void;
  onLogout: () => void;
  onUpdateUser: (username: string, updates: { name?: string; password?: string }) => void;
  darkMode?: boolean;
}

export default function Settings({ currentUser, onGoBack, onLogout, onUpdateUser, darkMode = false }: SettingsProps) {
  void darkMode;
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    onUpdateUser(currentUser.username, { name: name.trim() });
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }
    if (currentPassword !== currentUser.password) {
      setMessage({ type: 'error', text: 'Current password is incorrect' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    onUpdateUser(currentUser.username, { password: newPassword });
    setMessage({ type: 'success', text: 'Password changed successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={onGoBack} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-white/60 text-xs">ترتیبات</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab('profile'); setMessage(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <User className="w-4 h-4 inline mr-1" /> Profile
        </button>
        <button
          onClick={() => { setTab('password'); setMessage(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-1" /> Password
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain rounded-full border-2 border-gray-200" />
              <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">{currentUser.role}</p>
                <p className="text-xs text-gray-400">Username: {currentUser.username}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>

            <button onClick={handleSaveProfile} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Current Password *</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">New Password *</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>

            <button onClick={handleChangePassword} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700">
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          {shopInfo.name}
        </p>
      </div>
    </div>
  );
}
