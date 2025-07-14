import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  actualTheme: "light" | "dark"; // resolved theme (accounts for system preference)
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark", // default to dark since that's current setup
      actualTheme: "dark",

      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme to document
        const root = document.documentElement;

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.toggle("dark", systemTheme === "dark");
          set({ actualTheme: systemTheme });
        } else {
          root.classList.toggle("dark", theme === "dark");
          set({ actualTheme: theme });
        }
      },

      initializeTheme: () => {
        // Initialize theme on app startup
        const { theme } = get();

        if (typeof window !== "undefined") {
          const root = document.documentElement;

          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            root.classList.toggle("dark", systemTheme === "dark");
            set({ actualTheme: systemTheme });

            // Listen for system theme changes
            const mediaQuery = window.matchMedia(
              "(prefers-color-scheme: dark)"
            );
            const handleChange = (e: MediaQueryListEvent) => {
              if (get().theme === "system") {
                const newSystemTheme = e.matches ? "dark" : "light";
                root.classList.toggle("dark", newSystemTheme === "dark");
                set({ actualTheme: newSystemTheme });
              }
            };

            mediaQuery.addEventListener("change", handleChange);

            // Cleanup function (though not easily accessible in this pattern)
            return () => mediaQuery.removeEventListener("change", handleChange);
          } else {
            root.classList.toggle("dark", theme === "dark");
            set({ actualTheme: theme });
          }
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }), // Only persist theme preference
    }
  )
);

export default useThemeStore;
