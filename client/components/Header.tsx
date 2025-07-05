"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LogOut,
  Music,
  Home,
  Heart,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/authStore";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Music className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Sounds
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-medium">
                Premium Podcasts
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-5">
            <Link
              href="/"
              className="relative text-foreground hover:text-purple-400 transition-all duration-300 font-medium group px-3 py-2"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
            </Link>

            <Link
              href="/discover"
              className="relative text-foreground hover:text-purple-400 transition-all duration-300 font-medium group px-3 py-2"
            >
              <span className="relative z-10">Discover</span>
              <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/subscriptions"
                  className="relative text-foreground hover:text-purple-400 transition-all duration-300 font-medium group px-3 py-2"
                >
                  <span className="relative z-10">My Library</span>
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </Link>

                <Link
                  href="/playlists"
                  className="relative text-foreground hover:text-purple-400 transition-all duration-300 font-medium group px-3 py-2"
                >
                  <span className="relative z-10">Playlists</span>
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </Link>
              </>
            )}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search podcasts, episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-card/50 backdrop-blur-sm border-white/10 text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 rounded-full transition-all duration-300 focus:bg-card/80"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            </form>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 h-12 px-4 bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-full"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {user?.first_name || user?.username}
                  </span>
                </Button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 min-w-[240px] overflow-hidden">
                    <div className="p-4 border-b border-white/10">
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
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-purple-400 hover:bg-white/10 transition-all duration-300 h-10 px-6 rounded-full"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 h-10 px-6 rounded-full font-medium"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/10 py-3">
          <nav className="flex items-center justify-around">
            <Link
              href="/"
              className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-purple-400 transition-colors group"
            >
              <div className="p-2 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Home</span>
            </Link>

            <Link
              href="/discover"
              className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-purple-400 transition-colors group"
            >
              <div className="p-2 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">Discover</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/subscriptions"
                  className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-purple-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                    <Heart className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Library</span>
                </Link>

                <Link
                  href="/playlists"
                  className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-purple-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                    <Play className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Playlists</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
