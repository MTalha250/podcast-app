"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Heart, Play, Users, Star, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PodcastList, Podcast } from "@/types";
import { podcastsAPI, subscriptionsAPI } from "@/lib/api";
import useAuthStore from "@/store/authStore";

interface PodcastCardProps {
  podcast: PodcastList | Podcast;
  showSubscribeButton?: boolean;
  onSubscribe?: (podcastId: number) => void;
}

export default function PodcastCard({
  podcast,
  showSubscribeButton = true,
  onSubscribe,
}: PodcastCardProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Check subscription status when component mounts or auth status changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isAuthenticated) {
        setIsSubscribed(false);
        return;
      }

      try {
        setLoading(true);
        const subscriptions = await subscriptionsAPI.getAll();
        const isUserSubscribed = subscriptions.some(
          (sub) => sub.podcast === podcast.id
        );
        setIsSubscribed(isUserSubscribed);
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [isAuthenticated, podcast.id]);

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to podcasts", {
        duration: 3000,
      });
      router.push("/auth/login");
      return;
    }

    setIsSubscribing(true);
    const loadingToast = toast.loading(
      isSubscribed ? "Unsubscribing..." : "Subscribing..."
    );

    try {
      if (isSubscribed) {
        await podcastsAPI.unsubscribe(podcast.id);
        setIsSubscribed(false);
        toast.success(`Unsubscribed from ${podcast.title}`, {
          id: loadingToast,
        });
      } else {
        await podcastsAPI.subscribe(podcast.id);
        setIsSubscribed(true);
        toast.success(`Subscribed to ${podcast.title}`, {
          id: loadingToast,
        });
      }

      if (onSubscribe) {
        onSubscribe(podcast.id);
      }
    } catch (error: any) {
      console.error("Subscribe error:", error);
      toast.error(
        error?.response?.data?.detail ||
          `Failed to ${isSubscribed ? "unsubscribe from" : "subscribe to"} ${
            podcast.title
          }`,
        {
          id: loadingToast,
        }
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/podcasts/${podcast.id}`}>
      <Card className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-105 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 text-foreground group-hover:text-purple-400 transition-colors">
              {podcast.title}
            </h3>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">by {podcast.creator_name}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatDate(podcast.created_at)}</span>
              </div>
            </div>

            {/* Description for full podcast objects */}
            {"description" in podcast && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mt-3">
                {podcast.description}
              </p>
            )}
          </div>
        </CardContent>

        {showSubscribeButton && (
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button
              variant={isSubscribed ? "secondary" : "default"}
              size="sm"
              className={`w-full transition-all duration-300 h-9 sm:h-10 text-xs sm:text-sm ${
                isSubscribed
                  ? "bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105"
              }`}
              onClick={handleSubscribe}
              disabled={isSubscribing || loading}
            >
              {isSubscribing || loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current"></div>
                  <span>
                    {loading
                      ? "Checking..."
                      : isSubscribed
                      ? "Unsubscribing..."
                      : "Subscribing..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart
                    className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${
                      isSubscribed ? "fill-current text-red-400" : ""
                    }`}
                  />
                  <span className="font-medium">
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </span>
                </div>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
