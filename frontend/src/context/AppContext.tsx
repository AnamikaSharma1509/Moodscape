import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Movie, MoodProfile, User, AppNotification, DailyMood } from '../types';
import {
  getCurrentUser,
  logoutUser,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  saveDailyMood,
  getDailyMood,
  approveRoomAccess,
  denyRoomAccess,
  toggleUserMovie
} from '../services/api';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // Auth
  currentUser: User | null;
  token: string | null;
  isGuest: boolean;
  userId: string;
  userName: string;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  login: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  continueAsGuest: (name: string, avatar?: string) => void;
  // Mood
  moodProfile: MoodProfile | null;
  setMoodProfile: (profile: MoodProfile | null) => void;
  dailyMood: DailyMood | null;
  saveDailyMoodState: (answers: Record<string, string>, profile: MoodProfile, vector: Record<string, number>) => Promise<void>;
  refreshDailyMood: () => void;
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notifId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleApproveRequest: (roomCode: string, reqId: string) => Promise<void>;
  handleDenyRequest: (roomCode: string, reqId: string) => Promise<void>;
  // Movie collections
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (id: number) => boolean;
  watchlist: Movie[];
  toggleWatchlist: (movie: Movie) => void;
  isWatchlist: (id: number) => boolean;
  // Modals
  selectedMovie: Movie | null;
  setSelectedMovie: (m: Movie | null) => void;
  explanationMovie: Movie | null;
  setExplanationMovie: (m: Movie | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('moodscape_theme') as 'dark' | 'light') || 'dark';
  });

  // User & Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moodscape_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('moodscape_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [guestId, setGuestId] = useState<string>(() => {
    let id = localStorage.getItem('moodscape_guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('moodscape_guest_id', id);
    }
    return id;
  });

  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('moodscape_guest_name') || 'Guest Explorer';
  });

  const [guestAvatar, setGuestAvatar] = useState<string>(() => {
    return localStorage.getItem('moodscape_guest_avatar') || '🍿';
  });

  const isGuest = !currentUser;
  const userId = currentUser ? currentUser.id : guestId;
  const userName = currentUser ? currentUser.display_name : guestName;
  const userAvatar = currentUser ? currentUser.avatar : guestAvatar;

  // Verify and hydrate session from backend if token exists
  useEffect(() => {
    if (token && !currentUser) {
      getCurrentUser(token)
        .then((user) => {
          setCurrentUser(user);
          localStorage.setItem('moodscape_user', JSON.stringify(user));
        })
        .catch(() => {
          // Token invalid or expired
          setToken(null);
          setCurrentUser(null);
          localStorage.removeItem('moodscape_token');
          localStorage.removeItem('moodscape_user');
        });
    }
  }, [token, currentUser]);

  // Mood Profile State
  const [moodProfile, setMoodProfileState] = useState<MoodProfile | null>(() => {
    const saved = localStorage.getItem('moodscape_mood_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [dailyMood, setDailyMood] = useState<DailyMood | null>(null);

  // Sync Daily Mood with backend
  useEffect(() => {
    if (userId) {
      getDailyMood(userId).then((res) => {
        if (res) {
          setDailyMood(res);
          setMoodProfileState(res.mood_profile);
        }
      }).catch(err => console.warn('Could not load daily mood:', err));
    }
  }, [userId]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await fetchNotifications(userId);
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [userId]);

  // Poll notifications every 3 seconds for real-time room requests & approvals
  useEffect(() => {
    if (!userId) return;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 3000);
    return () => clearInterval(interval);
  }, [userId, refreshNotifications]);

  // Favorites & Watchlist State
  const [favorites, setFavorites] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('moodscape_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('moodscape_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [explanationMovie, setExplanationMovie] = useState<Movie | null>(null);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('moodscape_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (user: User, authToken: string) => {
    setCurrentUser(user);
    setToken(authToken);
    localStorage.setItem('moodscape_token', authToken);
    localStorage.setItem('moodscape_user', JSON.stringify(user));
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('moodscape_user', JSON.stringify(user));
  };


  const logout = () => {
    if (token) logoutUser(token);
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('moodscape_token');
    localStorage.removeItem('moodscape_user');
  };

  const continueAsGuest = (name: string, avatar: string = '🍿') => {
    setGuestName(name);
    setGuestAvatar(avatar);
    localStorage.setItem('moodscape_guest_name', name);
    localStorage.setItem('moodscape_guest_avatar', avatar);
  };

  const setUserAvatar = (avatar: string) => {
    if (currentUser) {
      const updated = { ...currentUser, avatar };
      setCurrentUser(updated);
      localStorage.setItem('moodscape_user', JSON.stringify(updated));
    } else {
      setGuestAvatar(avatar);
      localStorage.setItem('moodscape_guest_avatar', avatar);
    }
  };

  const setMoodProfile = (profile: MoodProfile | null) => {
    setMoodProfileState(profile);
    if (profile) {
      localStorage.setItem('moodscape_mood_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('moodscape_mood_profile');
    }
  };

  const saveDailyMoodState = async (answers: Record<string, string>, profile: MoodProfile, vector: Record<string, number>) => {
    setMoodProfile(profile);
    const today = new Date().toISOString().split('T')[0];
    const moodRecord: DailyMood = {
      mood_date: today,
      answers: answers as Record<string, 'A' | 'B'>,
      mood_profile: profile,
      preference_vector: vector,
      updated_at: new Date().toISOString()
    };
    setDailyMood(moodRecord);

    try {
      await saveDailyMood({
        user_id: userId,
        answers,
        mood_profile: profile,
        preference_vector: vector,
        mood_date: today
      });
    } catch (err) {
      console.warn('Failed to persist daily mood to backend:', err);
    }
  };

  const refreshDailyMood = () => {
    setMoodProfile(null);
    setDailyMood(null);
    localStorage.removeItem('moodscape_mood_profile');
  };

  const markAsRead = async (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    try {
      await markNotificationRead(notifId, userId);
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(userId);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleApproveRequest = async (roomCode: string, reqId: string) => {
    try {
      await approveRoomAccess(roomCode, userId, reqId);
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleDenyRequest = async (roomCode: string, reqId: string) => {
    try {
      await denyRoomAccess(roomCode, userId, reqId);
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to deny request');
    }
  };

  const toggleFavorite = (movie: Movie) => {
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id);
      const updated = exists ? prev.filter(m => m.id !== movie.id) : [...prev, movie];
      localStorage.setItem('moodscape_favorites', JSON.stringify(updated));
      return updated;
    });

    if (currentUser) {
      toggleUserMovie(currentUser.id, movie.id, 'favorite').catch(err => console.warn(err));
    }
  };

  const isFavorite = (id: number) => favorites.some(m => m.id === id);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist(prev => {
      const exists = prev.some(m => m.id === movie.id);
      const updated = exists ? prev.filter(m => m.id !== movie.id) : [...prev, movie];
      localStorage.setItem('moodscape_watchlist', JSON.stringify(updated));
      return updated;
    });

    if (currentUser) {
      toggleUserMovie(currentUser.id, movie.id, 'watchlist').catch(err => console.warn(err));
    }
  };

  const isWatchlist = (id: number) => watchlist.some(m => m.id === id);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        token,
        isGuest,
        userId,
        userName,
        userAvatar,
        setUserAvatar,
        login,
        updateUser,
        logout,
        continueAsGuest,
        moodProfile,
        setMoodProfile,
        dailyMood,
        saveDailyMoodState,
        refreshDailyMood,
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        handleApproveRequest,
        handleDenyRequest,
        favorites,
        toggleFavorite,
        isFavorite,
        watchlist,
        toggleWatchlist,
        isWatchlist,
        selectedMovie,
        setSelectedMovie,
        explanationMovie,
        setExplanationMovie,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
