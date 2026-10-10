import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Film, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../services/api';
import { useApp } from '../context/AppContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Read destination from location.state if redirected
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      login(res.user, res.token);
      handlePostAuthRedirect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest('Guest Moviegoer', '🍿');
    handlePostAuthRedirect();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-glow-purple flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your mood profile, saved movies, and collaborative rooms.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
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
            Or continue with
          </span>
        </div>

        {/* Real Google Sign In */}
        <GoogleSignInButton
          onSuccess={(data) => {
            login(data.user, data.token);
            handlePostAuthRedirect();
          }}
          onError={(err) => setErrorMessage(err)}
          buttonText="Sign in with Google"
        />

        {/* Guest Mode fallback */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Continue as Guest</span>
        </button>

        {/* Sign up link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            state={{ from: redirectUrl }}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline ml-1"
          >
            Create an Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-white/10 shadow-2xl text-center">
            {forgotSent ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Reset Link Ready</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instructions to reset your password have been processed for <span className="font-semibold text-slate-700 dark:text-slate-200">{forgotEmail}</span>.
                </p>
                <button
                  onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your email address and we'll help you regain access.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (forgotEmail) setForgotSent(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                  >
                    Send Link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
