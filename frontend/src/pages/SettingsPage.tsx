import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Moon, Sun, Check, AlertCircle, Shield, Sparkles, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateUserProfile, changePassword, resendVerification } from '../services/api';

const AVATAR_OPTIONS = ['🍿', '👩‍💻', '✨', '🍕', '🎭', '🦁', '🚀', '🎮', '🍩', '🥑', '🎬', '🌟'];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    token,
    updateUser,
    logout,
    theme,
    toggleTheme,
    userAvatar,
    setUserAvatar,
    userName
  } = useApp();

  // Profile Form State
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || userAvatar || '🍿');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await updateUserProfile({
        user_id: currentUser.id,
        first_name: firstName,
        last_name: lastName,
        avatar: avatar
      });

      updateUser(res.user);
      setUserAvatar(avatar);
      setProfileSuccess('Profile details saved successfully!');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword({
        user_id: currentUser.id,
        current_password: currentPassword,
        new_password: newPassword
      });

      setPasswordSuccess('Password changed securely!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-3xl">
          ⚙️
        </div>
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your MoodScape profile, customize credentials, and sync your movie library.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white font-bold text-sm transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors cursor-pointer mr-1"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Account & Appearance Settings
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 pl-8">
            Manage your personal profile, credentials, and theme settings.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out ({currentUser.first_name})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Appearance & Quick Overview */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 flex items-center justify-center text-3xl shadow-glow-purple">
                <span>{avatar}</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {currentUser.display_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                  {currentUser.email}
                </p>
                {currentUser.is_verified ? (
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ✓ Verified ({currentUser.auth_provider === 'google' ? 'Google' : 'Email'})
                  </span>
                ) : (
                  <div className="mt-1 space-y-1">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ⚠️ Unverified Email
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await resendVerification(currentUser.email);
                          setProfileSuccess('Verification link delivered to your email!');
                          setTimeout(() => setProfileSuccess(null), 3500);
                        } catch (e: any) {
                          setProfileError(e.message || 'Failed to resend verification');
                        }
                      }}
                      className="block text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Resend Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Theme Appearance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual presentation:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Profile & Security Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Edit Profile Form */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your display name and cinema avatar.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-sm text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400">Email cannot be changed directly</span>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Profile Emoji Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        avatar === em
                          ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-400'
                          : 'bg-slate-100 dark:bg-white/5 hover:scale-105'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all disabled:opacity-50 cursor-pointer"
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Security & Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your authentication password securely.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 dark:bg-white/10 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 dark:border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {passwordSaving ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
