import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Film, Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../services/api';
import { useApp } from '../context/AppContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

const AVATAR_OPTIONS = ['🍿', '👩‍💻', '✨', '🍕', '🎭', '🦁', '🚀', '🎮', '🍩', '🥑'];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('🍿');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectUrl = (location.state as any)?.from || '/';

  const handlePostAuthRedirect = () => {
    const pendingCode = sessionStorage.getItem('moodscape_pending_room');
    if (pendingCode) {
      sessionStorage.removeItem('moodscape_pending_room');
      navigate(`/rooms/join?code=${pendingCode}`);
    } else {
      navigate(redirectUrl, { replace: true });
    }
  };

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-emerald-400'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide both your first and last name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        avatar
      });

      login(res.user, res.token);
      handlePostAuthRedirect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-glow-purple flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join MoodScape to personalize movie recommendations and match with friends across all your devices.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Anamika"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-semibold">Strength:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{strengthLabels[strength]}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${strengthColors[strength]} transition-all duration-300`}
                    style={{ width: `${Math.max(15, (strength / 4) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Choose Avatar */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Choose Your Movie Avatar
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setAvatar(em)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                    avatar === em
                      ? 'bg-purple-600/20 border-2 border-purple-600 scale-110 shadow-glow-purple'
                      : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:scale-105'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/10" />
          </div>
          <span className="relative px-3 bg-white dark:bg-[#12151D] text-xs uppercase text-slate-400 font-semibold tracking-wider">
            Or register with
          </span>
        </div>

        {/* Real Google Sign Up / Sign In */}
        <GoogleSignInButton
          onSuccess={(data) => {
            login(data.user, data.token);
            handlePostAuthRedirect();
          }}
          onError={(err) => setErrorMessage(err)}
          buttonText="Sign up with Google"
        />

        {/* Link to login */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectUrl }}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
