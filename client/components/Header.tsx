"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, Music, Home, Heart, Play } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black">Sounds</span>
              <span className="text-xs text-gray-600 -mt-1">Podcasts</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Home
            </Link>

            <Link
              href="/discover"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Podcasts
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/subscriptions"
                  className="text-black hover:text-gray-600 transition-colors font-medium"
                >
                  My Sounds
                </Link>

                <Link
                  href="/playlists"
                  className="text-black hover:text-gray-600 transition-colors font-medium"
                >
                  Playlists
                </Link>
              </>
            )}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Sounds"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:border-black focus:ring-black rounded-full"
              />
            </form>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-black">
                    {user?.first_name || user?.username}
                  </span>
                </Button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                    <div className="py-1">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-black">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-black hover:bg-gray-100"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <nav className="flex items-center justify-around">
            <Link
              href="/"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-black transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </Link>

            <Link
              href="/discover"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-black transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Podcasts</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/subscriptions"
                  className="flex flex-col items-center space-y-1 text-gray-600 hover:text-black transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">My Sounds</span>
                </Link>

                <Link
                  href="/playlists"
                  className="flex flex-col items-center space-y-1 text-gray-600 hover:text-black transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span className="text-xs">Playlists</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Click outside handler */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
