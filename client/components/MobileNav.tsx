"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Compass,
  Search,
  Heart,
  List,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import useAuthStore from "@/store/authStore";

interface MobileNavProps {
  className?: string;
}

export default function MobileNav({ className = "" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/search", label: "Search", icon: Search },
    ...(isAuthenticated
      ? [
          { href: "/subscriptions", label: "Subscriptions", icon: Heart },
          { href: "/playlists", label: "Playlists", icon: List },
        ]
      : []),
  ];

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 dark:border-white/10 border-border/20 hover:bg-white/10 transition-all duration-300"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <div className="relative w-5 h-5">
          {/* Animated hamburger/close icon */}
          <span
            className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ${
              isOpen ? "rotate-45 top-2" : "top-0"
            }`}
          />
          <span
            className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 top-2 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ${
              isOpen ? "-rotate-45 top-2" : "top-4"
            }`}
          />
        </div>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card/95 backdrop-blur-xl border-l border-white/10 dark:border-white/10 border-border/20 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/10 border-border/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Sounds
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle variant="button" className="w-8 h-8" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-white/10 dark:border-white/10 border-border/20 p-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-card/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full"
                >
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
