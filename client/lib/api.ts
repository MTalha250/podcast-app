import axios from "axios";
import {
  User,
  LoginResponse,
  RegisterRequest,
  Category,
  Podcast,
  PodcastList,
  Episode,
  EpisodeList,
  Playlist,
  PlaylistCreate,
  Subscription,
  SearchResult,
  ApiResponse,
  FilterState,
} from "@/types";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage (client-side only)
if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("access_token");
  refreshToken = localStorage.getItem("refresh_token");
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token refresh function
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
      {
        refresh: refreshToken,
      }
    );

    const { access, refresh: newRefresh } = response.data;

    accessToken = access;
    refreshToken = newRefresh;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", newRefresh);
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Set tokens function
export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;

  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
}

// Clear tokens function
export function clearTokens() {
  accessToken = null;
  refreshToken = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
}

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/register/", data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login/", { username, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (refreshToken) {
      try {
        await api.post("/auth/logout/", { refresh: refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    clearTokens();
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/profile/");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put("/profile/", data);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories/");
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },
};

// Podcasts API
export const podcastsAPI = {
  getAll: async (filters?: FilterState): Promise<PodcastList[]> => {
    const params = new URLSearchParams();
    if (filters?.category)
      params.append("category", filters.category.toString());
    if (filters?.creator) params.append("creator", filters.creator.toString());
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(`/podcasts/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Podcast> => {
    const response = await api.get(`/podcasts/${id}/`);
    return response.data;
  },

  getMyPodcasts: async (): Promise<PodcastList[]> => {
    const response = await api.get("/podcasts/my_podcasts/");
    return response.data;
  },

  subscribe: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/podcasts/${id}/subscribe/`);
    return response.data;
  },

  unsubscribe: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/podcasts/${id}/unsubscribe/`);
    return response.data;
  },
};

// Episodes API
export const episodesAPI = {
  getAll: async (filters?: {
    podcast?: number;
    search?: string;
  }): Promise<EpisodeList[]> => {
    const params = new URLSearchParams();
    if (filters?.podcast) params.append("podcast", filters.podcast.toString());
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(`/episodes/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Episode> => {
    const response = await api.get(`/episodes/${id}/`);
    return response.data;
  },

  getRecent: async (): Promise<EpisodeList[]> => {
    const response = await api.get("/episodes/recent/");
    return response.data;
  },

  getPodcastEpisodes: async (podcastId: number): Promise<EpisodeList[]> => {
    const response = await api.get(`/episodes/?podcast=${podcastId}`);
    return response.data;
  },
};

// Playlists API
export const playlistsAPI = {
  getAll: async (): Promise<Playlist[]> => {
    const response = await api.get("/playlists/");
    return response.data;
  },

  getById: async (id: number): Promise<Playlist> => {
    const response = await api.get(`/playlists/${id}/`);
    return response.data;
  },

  create: async (data: PlaylistCreate): Promise<Playlist> => {
    const response = await api.post("/playlists/", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<PlaylistCreate>
  ): Promise<Playlist> => {
    const response = await api.put(`/playlists/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/`);
  },

  addEpisode: async (
    playlistId: number,
    episodeId: number
  ): Promise<{ message: string }> => {
    const response = await api.post(`/playlists/${playlistId}/add_episode/`, {
      episode_id: episodeId,
    });
    return response.data;
  },

  removeEpisode: async (
    playlistId: number,
    episodeId: number
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/playlists/${playlistId}/remove_episode/`,
      {
        data: { episode_id: episodeId },
      }
    );
    return response.data;
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: async (): Promise<Subscription[]> => {
    const response = await api.get("/subscriptions/");
    return response.data;
  },
};

// Search API
export const searchAPI = {
  search: async (query: string): Promise<SearchResult> => {
    const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getTrending: async (): Promise<PodcastList[]> => {
    const response = await api.get("/trending/");
    return response.data;
  },
};

// User Stats API
export const statsAPI = {
  getUserStats: async (): Promise<{
    podcasts_created: number;
    playlists_created: number;
    subscriptions: number;
  }> => {
    const response = await api.get("/stats/");
    return response.data;
  },
};

export default api;
