import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginResponse, RegisterRequest } from "@/types";
import { authAPI, setTokens, clearTokens } from "@/lib/api";

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  updateUser: (user: User) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response: LoginResponse = await authAPI.login(
            username,
            password
          );

          // Set tokens in API layer
          setTokens(response.access, response.refresh);

          // Update state
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.detail ||
              error.response?.data?.error ||
              "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Register action
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response: LoginResponse = await authAPI.register(data);

          // Set tokens in API layer
          setTokens(response.access, response.refresh);

          // Update state
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.username?.[0] ||
            error.response?.data?.email?.[0] ||
            error.response?.data?.password?.[0] ||
            error.response?.data?.detail ||
            "Registration failed";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear tokens and state
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Initialize auth from localStorage
      initializeAuth: () => {
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user");
          const accessToken = localStorage.getItem("access_token");

          if (storedUser && accessToken) {
            try {
              const user = JSON.parse(storedUser);
              set({
                user,
                isAuthenticated: true,
              });
            } catch (error) {
              // Invalid stored data, clear it
              clearTokens();
            }
          }
        }
      },

      // Update user action
      updateUser: (user: User) => {
        set({ user });
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
