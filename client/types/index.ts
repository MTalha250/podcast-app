// User types
export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type LoginResponse = {
  user: User;
  access: string;
  refresh: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
};

// Category types
export type Category = {
  id: number;
  name: string;
};

// Podcast types
export type Podcast = {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  category: number;
  category_name: string;
  creator: number;
  creator_name: string;
  created_at: string;
};

export type PodcastList = {
  id: number;
  title: string;
  cover_image?: string;
  creator_name: string;
  category_name: string;
  created_at: string;
};

// Episode types
export type Episode = {
  id: number;
  title: string;
  description: string;
  audio_file: string;
  podcast: number;
  podcast_title: string;
  duration: number;
  created_at: string;
};

export type EpisodeList = {
  id: number;
  title: string;
  podcast_title: string;
  duration: number;
  created_at: string;
};

// Playlist types
export type Playlist = {
  id: number;
  name: string;
  user: number;
  episodes: Episode[];
  episode_count: number;
  created_at: string;
};

export type PlaylistCreate = {
  name: string;
};

// Subscription types
export type Subscription = {
  id: number;
  user: number;
  user_name: string;
  podcast: number;
  podcast_title: string;
  created_at: string;
};

// Search types
export type SearchResult = {
  podcasts: PodcastList[];
  episodes: EpisodeList[];
};

// API Response types - simplified without pagination
export type ApiResponse<T> = T;

// Error types
export type ApiError = {
  detail?: string;
  error?: string;
  [key: string]: any;
};

// UI State types
export type LoadingState = {
  [key: string]: boolean;
};

export type FilterState = {
  category?: number;
  search?: string;
  creator?: number;
};
