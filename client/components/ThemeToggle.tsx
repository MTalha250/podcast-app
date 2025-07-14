"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import useThemeStore, { Theme } from "@/store/themeStore";

interface ThemeToggleProps {
  variant?: "button" | "switch" | "dropdown";
  className?: string;
}

export default function ThemeToggle({
  variant = "button",
  className = "",
}: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, initializeTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    initializeTheme();
  }, [initializeTheme]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`w-10 h-10 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 ${className}`}
      >
        <div className="w-4 h-4 bg-muted-foreground/50 rounded-full animate-pulse" />
      </Button>
    );
  }

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] =
    [
      { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
      { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
      {
        value: "system",
        label: "System",
        icon: <Monitor className="h-4 w-4" />,
      },
    ];

  const currentThemeOption = themeOptions.find(
    (option) => option.value === theme
  );
  const currentIcon =
    actualTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );

  if (variant === "switch") {
    // Simple toggle between light and dark (ignores system)
    const toggleTheme = () => {
      setTheme(actualTheme === "dark" ? "light" : "dark");
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={`relative w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden group ${className}`}
      >
        {/* Background animation */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            actualTheme === "dark"
              ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20"
              : "bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
          }`}
        />

        {/* Icon with rotation animation */}
        <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-110">
          {actualTheme === "dark" ? (
            <Moon className="h-5 w-5 text-purple-400 transition-colors duration-300" />
          ) : (
            <Sun className="h-5 w-5 text-orange-500 transition-colors duration-300" />
          )}
        </div>

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-current/10 to-current/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </Button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`h-10 px-3 bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 ${className}`}
        >
          <div className="flex items-center space-x-2">
            {currentThemeOption?.icon}
            <span className="text-sm font-medium hidden sm:block">
              {currentThemeOption?.label}
            </span>
          </div>
        </Button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 min-w-[140px] overflow-hidden">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setShowDropdown(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 text-sm transition-colors hover:bg-white/10 ${
                    theme === option.value
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant - simple toggle
  const toggleTheme = () => {
    setTheme(actualTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden group ${className}`}
      title={`Switch to ${actualTheme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Animated background */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          actualTheme === "dark"
            ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10"
            : "bg-gradient-to-r from-yellow-400/10 to-orange-400/10"
        }`}
      />

      {/* Icon container with flip animation */}
      <div className="relative z-10 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
        <div
          className={`transition-all duration-500 ${
            actualTheme === "dark"
              ? "rotate-0 opacity-100"
              : "rotate-180 opacity-0 absolute"
          }`}
        >
          <Moon className="h-4 w-4 text-purple-400" />
        </div>
        <div
          className={`transition-all duration-500 ${
            actualTheme === "light"
              ? "rotate-0 opacity-100"
              : "-rotate-180 opacity-0 absolute"
          }`}
        >
          <Sun className="h-4 w-4 text-orange-500" />
        </div>
      </div>

      {/* Subtle glow effect */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 group-hover:shadow-lg ${
          actualTheme === "dark"
            ? "group-hover:shadow-purple-500/20"
            : "group-hover:shadow-orange-500/20"
        }`}
      />
    </Button>
  );
}
