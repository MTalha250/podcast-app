"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LogOut,
  Music,
  Sparkles,
  Search,
  TrendingUp,
  Heart,
  List,
  Compass,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 dark:border-white/10 border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:scale-105 transition-transform duration-300 flex-shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Music className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Sounds
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-medium hidden sm:block">
                Premium Podcasts
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === "/"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/discover"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === "/discover"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Discover</span>
            </Link>
            <Link
              href="/search"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === "/search"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/subscriptions"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    pathname === "/subscriptions"
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Subscriptions</span>
                </Link>
                <Link
                  href="/playlists"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    pathname === "/playlists"
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Playlists</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Desktop Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle variant="button" />
            </div>

            {/* Desktop User Menu */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 h-10 sm:h-12 px-3 sm:px-4 bg-card/50 backdrop-blur-sm border border-white/10 dark:border-white/10 border-border/20 hover:bg-white/10 transition-all duration-300 rounded-full"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-foreground">
                      {user?.first_name || user?.username}
                    </span>
                  </Button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/10 border-border/20 rounded-xl shadow-2xl z-20 min-w-[240px] overflow-hidden">
                      <div className="p-4 border-b border-white/10 dark:border-white/10 border-border/20">
                        <p className="text-sm font-semibold text-foreground">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
