import {
  Movie,
  MoodProfile,
  RecommendationsData,
  RoomData,
  QuizQuestion,
  VoteType,
  User,
  AppNotification,
  DiscoverableRoom,
  DailyMood
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Fallback questions in case backend is offline
export const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Do you:",
    options: [
      { id: "A", text: "Want to solve any mystery or case?", icon: "Search", tags: ["Thriller", "Detective", "Mystery"] },
      { id: "B", text: "Want to get a follow-up routine of a ghost?", icon: "Ghost", tags: ["Horror", "Supernatural", "Chills"] }
    ]
  },
  {
    id: "q2",
    question: "Do you want:",
    options: [
      { id: "A", text: "Goosebumps all over your body and tears gathering in your eyes?", icon: "HeartHandshake", tags: ["Sad", "Emotional", "Drama"] },
      { id: "B", text: "A sudden mini heart attack because of someone's presence?", icon: "Zap", tags: ["Horror", "Suspense", "Adrenaline"] }
    ]
  },
  {
    id: "q3",
    question: "Do you want:",
    options: [
      { id: "A", text: "Some handsome dude doing some action, falling off a cliff?", icon: "Flame", tags: ["Action", "Adventure", "Spectacle"] },
      { id: "B", text: "A nerd detective solving a mystery?", icon: "Glasses", tags: ["Detective", "Mystery", "Thriller"] }
    ]
  },
  {
    id: "q4",
    question: "Do you want to:",
    options: [
      { id: "A", text: "LOL, rolling on the bed?", icon: "Laugh", tags: ["Comedy", "Hilarious", "Feel-Good"] },
      { id: "B", text: "Get some butterflies in your stomach?", icon: "Heart", tags: ["Romance", "Romantic Comedy", "Sweet"] }
    ]
  },
  {
    id: "q5",
    question: "Either you want to:",
    options: [
      { id: "A", text: "Roam all continents while playing mind games", icon: "Compass", tags: ["Adventure", "Thriller", "Mind Game"] },
      { id: "B", text: "Do all the chores while being stuck in a town all your life.", icon: "Coffee", tags: ["Slice of Life", "Relaxed", "Cozy Vibes"] }
    ]
  },
  {
    id: "q6",
    question: "Would you prefer something light-hearted or something with a bit more depth?",
    options: [
      { id: "A", text: "Something light-hearted", icon: "Sun", tags: ["Comedy", "Romance", "Feel-Good"] },
      { id: "B", text: "Something with a bit more depth", icon: "BookOpen", tags: ["Drama", "Psychological", "Emotional"] }
    ]
  },
  {
    id: "q7",
    question: "Do you want something that will make you laugh out loud or something that will keep you on the edge of your seat?",
    options: [
      { id: "A", text: "Make me laugh out loud", icon: "Sparkles", tags: ["Comedy", "Feel-Good", "Fun"] },
      { id: "B", text: "Keep me on the edge of my seat", icon: "Activity", tags: ["Thriller", "Suspense", "Gripping"] }
    ]
  }
];

// ----------------- AUTHENTICATION API -----------------

export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  avatar?: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed');
  }
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function loginWithGoogle(credential: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Google authentication failed');
  }
  return res.json();
}

export async function verifyEmail(token: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Verification failed');
  }
  return res.json();
}

export async function resendVerification(email_or_user_id: string): Promise<{ status: string; message: string; verification_token?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_user_id })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to resend verification');
  }
  return res.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Session expired');
  return res.json();
}

export async function logoutUser(token?: string): Promise<void> {
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.warn('Logout error:', err);
  }
}

export async function updateUserProfile(data: {
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}): Promise<{ user: User; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update profile');
  }
  return res.json();
}

export async function changePassword(data: {
  user_id: string;
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to change password');
  }
  return res.json();
}

// ----------------- DAILY MOOD API -----------------

export async function saveDailyMood(data: {
  user_id: string;
  answers: Record<string, string>;
  mood_profile: MoodProfile;
  preference_vector: Record<string, number>;
  mood_date?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/user/daily-mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save daily mood');
  return res.json();
}

export async function getDailyMood(userId: string, moodDate?: string): Promise<DailyMood | null> {
  const params = new URLSearchParams({ user_id: userId });
  if (moodDate) params.set('mood_date', moodDate);
  const res = await fetch(`${API_BASE_URL}/user/daily-mood?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.daily_mood;
}

// ----------------- NOTIFICATIONS API -----------------

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const res = await fetch(`${API_BASE_URL}/notifications?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

export async function markNotificationRead(notifId: string, userId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notifId)}/read?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST'
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/read-all?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST'
  });
}

// ----------------- USER MOVIE LISTS API -----------------

export async function toggleUserMovie(userId: string, movieId: number, listType: 'favorite' | 'watchlist'): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/user/movies/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, movie_id: movieId, list_type: listType })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.is_saved;
}

export async function fetchUserMovieIds(userId: string, listType: 'favorite' | 'watchlist'): Promise<number[]> {
  const res = await fetch(`${API_BASE_URL}/user/movies?user_id=${encodeURIComponent(userId)}&list_type=${listType}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.movie_ids || [];
}

// ----------------- QUIZ & RECOMMENDATION API -----------------

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/quiz-questions`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.questions || FALLBACK_QUESTIONS;
  } catch (err) {
    console.warn('Using fallback quiz questions:', err);
    return FALLBACK_QUESTIONS;
  }
}

export async function submitQuizAnswers(answers: Record<string, string>): Promise<MoodProfile> {
  const res = await fetch(`${API_BASE_URL}/mood-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers)
  });
  if (!res.ok) throw new Error('Failed to generate mood profile');
  return res.json();
}

export async function fetchRecommendations(
  answers?: Record<string, string>,
  preference_vector?: Record<string, number>
): Promise<RecommendationsData> {
  const res = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, preference_vector, limit: 12 })
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchMovies(params?: {
  category?: string;
  genre?: string;
  mood?: string;
  min_rating?: number;
}): Promise<{ count: number; movies: Movie[] }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.mood) searchParams.set('mood', params.mood);
  if (params?.min_rating) searchParams.set('min_rating', params.min_rating.toString());

  const res = await fetch(`${API_BASE_URL}/movies?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

export async function searchMovies(q: string): Promise<{ query: string; count: number; results: Movie[] }> {
  const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getMovieById(id: number): Promise<Movie> {
  const res = await fetch(`${API_BASE_URL}/movies/${id}`);
  if (!res.ok) throw new Error('Movie not found');
  return res.json();
}

// ----------------- GROUP ROOMS & DISCOVERY API -----------------

export async function fetchDiscoverableRooms(): Promise<DiscoverableRoom[]> {
  const res = await fetch(`${API_BASE_URL}/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  const data = await res.json();
  return data.rooms || [];
}

export async function createRoom(data: {
  room_name: string;
  host_name: string;
  host_id?: string;
  movie_count?: number;
  category?: string;
  min_rating?: number;
  access_type?: string;
  max_participants?: number;
  is_discoverable?: boolean;
  host_preference_vector?: Record<string, number>;
  host_mood_title?: string;
}): Promise<{ room_code: string; room: RoomData }> {
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function getRoom(code: string, user_id?: string): Promise<RoomData> {
  const url = user_id ? `${API_BASE_URL}/rooms/${code}?user_id=${encodeURIComponent(user_id)}` : `${API_BASE_URL}/rooms/${code}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Room not found or expired');
  return res.json();
}

export async function requestRoomAccess(code: string, data: {
  user_id: string;
  display_name: string;
  avatar?: string;
  preference_vector?: Record<string, number>;
  mood_title?: string;
}): Promise<{ status: string; message: string; request?: any; participant?: any }> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/request-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to request room access');
  }
  return res.json();
}

export async function approveRoomAccess(code: string, host_id: string, request_id: string): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/approve-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host_id, request_id })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to approve request');
  }
  const data = await res.json();
  return data.room;
}

export async function denyRoomAccess(code: string, host_id: string, request_id: string): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/deny-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host_id, request_id })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to deny request');
  }
  const data = await res.json();
  return data.room;
}

export async function joinRoom(code: string, data: {
  display_name: string;
  user_id?: string;
  avatar?: string;
  preference_vector?: Record<string, number>;
  mood_title?: string;
}): Promise<{ joined: boolean; participant: any; room: RoomData }> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_code: code, ...data })
  });
  if (!res.ok) throw new Error('Failed to join room');
  return res.json();
}

export async function toggleReady(code: string, user_id: string): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/ready?user_id=${encodeURIComponent(user_id)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to update ready state');
  return res.json();
}

export async function startRoom(code: string, host_id: string): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/start?host_id=${encodeURIComponent(host_id)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start session');
  return res.json();
}

export async function startRoundTwo(code: string, host_id: string): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/round2?host_id=${encodeURIComponent(host_id)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start round 2');
  const data = await res.json();
  return data.room;
}

export async function submitVote(code: string, user_id: string, movie_id: number, vote: VoteType): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/${code}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, movie_id, vote })
  });
  if (!res.ok) throw new Error('Failed to submit vote');
  return res.json();
}

export async function getDemoRoom(): Promise<RoomData> {
  const res = await fetch(`${API_BASE_URL}/rooms/demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load demo room');
  return res.json();
}
