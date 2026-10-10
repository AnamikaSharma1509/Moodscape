export interface QuizOption {
  id: 'A' | 'B';
  text: string;
  icon: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface MoodProfile {
  profile_title: string;
  tagline: string;
  description: string;
  primary_genres: string[];
  secondary_genres: string[];
  energy_level: string;
  emotional_tone: string;
  preference_vector: Record<string, number>;
}

export interface MovieExplanation {
  content_match_pct: number;
  genre_match_pct: number;
  mood_match_pct: number;
  overall_match_pct: number;
  explanation_text: string;
  consensus_reasons?: string[];
  individual_matches?: Record<string, number>;
  average_compatibility?: number;
  minimum_compatibility?: number;
  consensus?: number;
  group_score?: number;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  genres: string[];
  overview: string;
  rating: number;
  vote_count: number;
  popularity: number;
  runtime: number;
  director: string;
  cast: string[];
  poster_path: string;
  backdrop_path?: string;
  mood_tags: string[];
  category: 'Hollywood' | 'Bollywood' | 'Vintage' | 'Hidden Gem' | 'International' | string;
  streaming_providers: string[];
  language: string;
  match_score?: number;
  explanation?: MovieExplanation;
}

export interface RecommendationsData {
  profile?: MoodProfile;
  top_picks: Movie[];
  hollywood_picks: Movie[];
  bollywood_picks: Movie[];
  vintage_picks: Movie[];
  hidden_gems: Movie[];
  wildcard_pick?: Movie;
}

export interface Participant {
  user_id: string;
  display_name: string;
  avatar: string;
  is_ready: boolean;
  is_host: boolean;
  preference_vector?: Record<string, number>;
  mood_title?: string;
}

export type VoteType = 'LIKE' | 'DISLIKE' | 'SUPERLIKE';

export interface RoomSettings {
  movie_count: number;
  category?: string;
  min_rating?: number;
}

export interface AccessRequest {
  request_id: string;
  user_id: string;
  display_name: string;
  avatar: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requested_at: string;
  preference_vector?: Record<string, number>;
  mood_title?: string;
}

export interface GroupResultsData {
  winner?: Movie;
  winner_score: number;
  best_matches: Movie[];
  everyone_likes: Movie[];
  near_unanimous: Movie[];
  most_divisive?: Movie;
  wildcard_pick?: Movie;
  personal_picks: Record<string, Movie>;
  group_dna: { genre: string; percentage: number }[];
  all_ranked: any[];
  total_participants: number;
  total_movies_reviewed: number;
}

export interface RoomData {
  code: string;
  name: string;
  host_id: string;
  host_name?: string;
  status: 'WAITING' | 'VOTING' | 'PROCESSING' | 'RESULTS' | 'CLOSED';
  access_type: 'approval_required' | 'public_open' | 'private_invite' | string;
  max_participants: number;
  is_discoverable: boolean;
  round: number;
  settings: RoomSettings;
  participants: Participant[];
  total_movies: number;
  deck: Movie[];
  my_votes: Record<number, VoteType>;
  voting_progress: Record<string, { display_name: string; voted_count: number; has_finished: boolean }>;
  access_requests?: AccessRequest[];
  results?: GroupResultsData;
}

export interface DiscoverableRoom {
  code: string;
  name: string;
  host_id: string;
  host_name: string;
  participant_count: number;
  max_participants: number;
  status: string;
  access_type: string;
  movie_count: number;
  category: string;
  min_rating: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
  display_name: string;
  auth_provider?: 'local' | 'google' | string;
  is_verified?: boolean;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'ROOM_ACCESS_REQUEST' | 'ROOM_ACCESS_APPROVED' | 'ROOM_ACCESS_DENIED' | 'ROOM_STARTED' | 'SESSION_RESULTS' | 'ROOM_JOINED' | string;
  title: string;
  message: string;
  room_code?: string;
  request_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface DailyMood {
  mood_date: string;
  answers: Record<string, 'A' | 'B'>;
  mood_profile: MoodProfile;
  preference_vector: Record<string, number>;
  updated_at: string;
}
