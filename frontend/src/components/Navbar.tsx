import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  Users,
  Sparkles,
  Heart,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Check,
  LogOut,
  User as UserIcon,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Compass,
  LogIn,
  UserPlus,
  HelpCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    userAvatar,
    userName,
    currentUser,
    isGuest,
    logout,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleApproveRequest,
    handleDenyRequest
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Escape key handler to dismiss drawer and dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) {
          setMenuOpen(false);
          hamburgerBtnRef.current?.focus();
        }
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (
        menuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  // Lock body scroll when hamburger drawer is open on mobile
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    logout();
    setMenuOpen(false);
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-glow-purple group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0B0D13] rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              MOOD<span className="text-gradient-brand">SCAPE</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
              Your Mood • Your Movie
            </span>
          </div>
        </Link>

        {/* Desktop Header Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          <Link
            to="/quiz"
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              isActive('/quiz')
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Mood Quiz
          </Link>

          <Link
            to="/rooms"
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              location.pathname.startsWith('/rooms')
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-pink-400" />
            Group Movie Night
          </Link>

          <Link
            to="/search"
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              isActive('/search')
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            Discover Movies
          </Link>

          <Link
            to="/favorites"
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/favorites')
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            Saved Movies
          </Link>
        </nav>

        {/* Header Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Quick Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] min-w-[18px] text-center shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 dark:shadow-black/80 p-4 space-y-3 z-50 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <Clock className="w-6 h-6 mx-auto text-slate-400 dark:text-slate-500" />
                      <p className="font-medium">No notifications yet</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Activity and room requests will appear here</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border transition-colors space-y-2 ${
                          notif.is_read
                            ? 'bg-slate-50 dark:bg-[#1a1f30] border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200'
                            : 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-600/50 text-slate-900 dark:text-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs">{notif.title}</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex-shrink-0 cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {notif.type === 'ROOM_ACCESS_REQUEST' && notif.room_code && notif.request_id && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                handleApproveRequest(notif.room_code!, notif.request_id!);
                                markAsRead(notif.id);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                handleDenyRequest(notif.room_code!, notif.request_id!);
                                markAsRead(notif.id);
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Deny
                            </button>
                          </div>
                        )}

                        {notif.type === 'ROOM_ACCESS_APPROVED' && notif.room_code && (
                          <button
                            onClick={() => {
                              navigate(`/rooms/${notif.room_code}`);
                              setNotificationsOpen(false);
                            }}
                            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline block pt-0.5 cursor-pointer"
                          >
                            Enter Room Lobby →
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Room CTA (Hidden on tiny screens) */}
          <button
            onClick={() => navigate('/rooms/create')}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-glow-purple transition-all duration-200 hover:scale-[1.02] items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          {/* Desktop User Profile Pill & Dropdown (Includes All Menu Options) */}
          <div className="relative hidden lg:block" ref={userRef}>
            {currentUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-purple-400 transition-colors cursor-pointer"
                aria-label="User Account Menu"
              >
                <span className="text-base">{userAvatar}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.first_name}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-purple-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Account Menu"
              >
                <span>🍿</span>
                <span>Account</span>
              </button>
            )}

            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 dark:shadow-black/80 p-2.5 space-y-1.5 z-50 animate-in zoom-in-95 duration-150">
                {/* User Header Info */}
                {currentUser ? (
                  <div className="px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-[#1a1f30] border border-purple-200 dark:border-purple-600/30 mb-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {currentUser.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                      {currentUser.is_verified ? '✓ Verified Member' : 'Registered Member'}
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1a1f30] border border-slate-200 dark:border-slate-700 mb-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">Guest Explorer</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Sign in to save movies & sync rooms</p>
                    <div className="flex gap-2 pt-2">
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] text-center shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex-1 py-1.5 rounded-lg border border-purple-300 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold text-[11px] text-center"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}

                {/* Account & Profile Links */}
                {currentUser && (
                  <div className="space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>
                )}

                {/* All Menu & Feature Options (Consolidated into Profile Dropdown) */}
                <div className="pt-1 border-t border-slate-200 dark:border-slate-700/80 space-y-0.5">
                  <Link
                    to="/favorites"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Saved Movies</span>
                  </Link>

                  <Link
                    to="/quiz"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span>Solo Mood Quiz</span>
                  </Link>

                  <Link
                    to="/rooms"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <Users className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                    <span>Group Movie Night</span>
                  </Link>

                  <Link
                    to="/rooms/create"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Create a Room</span>
                  </Link>

                  <Link
                    to="/search"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <Compass className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Discover Movies</span>
                  </Link>

                  <Link
                    to="/how-it-works"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>How It Works</span>
                  </Link>
                </div>

                {/* Appearance Theme Switcher inside Dropdown */}
                <div className="pt-1 border-t border-slate-200 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1f30] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span>Theme</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                {/* Sign Out Option */}
                {currentUser && (
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-700/80">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HAMBURGER MENU BUTTON: ONLY VISIBLE ON MOBILE & TABLET (lg:hidden) */}
          <button
            ref={hamburgerBtnRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="lg:hidden p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* FULL-PAGE MOBILE HAMBURGER MENU (OPENS WHOLE MENU ON PAGE, NOT SMALL SCROLLABLE PANEL) */}
      {menuOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Main Navigation Menu"
          className="fixed inset-0 z-50 bg-white dark:bg-[#0B0D13] flex flex-col overflow-y-auto animate-in fade-in duration-200"
        >
          {/* Top Bar Header with Logo & Close Button */}
          <div className="h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10 flex-shrink-0">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-glow-purple">
                <div className="w-full h-full bg-[#0B0D13] rounded-[9px] flex items-center justify-center">
                  <Film className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                MOOD<span className="text-gradient-brand">SCAPE</span>
              </span>
            </Link>

            <button
              onClick={() => setMenuOpen(false)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full-Page Menu Body */}
          <div className="flex-1 px-5 py-6 space-y-6 max-w-lg mx-auto w-full">
            {/* User Account / Profile Card */}
            {currentUser ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121622] border border-purple-500/20 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl">{userAvatar}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser.display_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {currentUser.is_verified ? '✓ Verified Member' : 'Registered Member'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-purple-400"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/20 space-y-3">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Welcome to MoodScape</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sign in to personalize movie recommendations, save favorites, and join rooms.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="py-2.5 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Main Navigation - Full Width Interactive Cards */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Explore & Discovery
              </span>
              <nav className="grid grid-cols-1 gap-2.5">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Home className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="block font-bold">Home</span>
                    <span className="block text-[11px] opacity-70">Main landing and featured picks</span>
                  </div>
                </Link>

                <Link
                  to="/quiz"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/quiz')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="block font-bold">Solo Mood Quiz</span>
                    <span className="block text-[11px] opacity-70">7-question AI mood profile & recommendations</span>
                  </div>
                </Link>

                <Link
                  to="/rooms"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    location.pathname.startsWith('/rooms') && !location.pathname.includes('/create')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Users className="w-5 h-5 text-pink-400" />
                  <div>
                    <span className="block font-bold">Group Movie Night</span>
                    <span className="block text-[11px] opacity-70">Collaborative swipe rooms & match consensus</span>
                  </div>
                </Link>

                <Link
                  to="/rooms/create"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/rooms/create')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="block font-bold">Host a New Room</span>
                    <span className="block text-[11px] opacity-70">Create a shareable room with custom deck size</span>
                  </div>
                </Link>

                <Link
                  to="/search"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/search')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Compass className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="block font-bold">Discover & Search</span>
                    <span className="block text-[11px] opacity-70">Filter by category, rating, mood, or keywords</span>
                  </div>
                </Link>

                <Link
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/favorites')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Heart className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="block font-bold">Saved Movies</span>
                    <span className="block text-[11px] opacity-70">Your starred watchlist collection</span>
                  </div>
                </Link>

                <Link
                  to="/how-it-works"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive('/how-it-works')
                      ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="block font-bold">How It Works</span>
                    <span className="block text-[11px] opacity-70">5-step guide to finding common movies</span>
                  </div>
                </Link>
              </nav>
            </div>

            {/* Profile & Settings shortcuts if logged in */}
            {currentUser && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Account Details
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <UserIcon className="w-4 h-4 text-purple-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Appearance Switcher */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white shadow-sm cursor-pointer"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Brand Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
              <p>MoodScape Cinema • Your Mood. Your Movie. Your People.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
