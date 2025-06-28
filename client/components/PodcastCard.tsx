"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Heart, Play, Users } from "lucide-react";
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
      <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
            {podcast.cover_image ? (
              <img
                src={process.env.NEXT_PUBLIC_IMAGE_URL + podcast.cover_image}
                alt={podcast.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {podcast.title}
            </h3>

            <p className="text-sm text-gray-600">by {podcast.creator_name}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {podcast.category_name}
              </span>
              <span>{formatDate(podcast.created_at)}</span>
            </div>

            {/* Description for full podcast objects */}
            {"description" in podcast && (
              <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                {podcast.description}
              </p>
            )}
          </div>
        </CardContent>

        {showSubscribeButton && (
          <CardFooter className="p-4 pt-0">
            <Button
              variant={isSubscribed ? "secondary" : "default"}
              size="sm"
              className="w-full"
              onClick={handleSubscribe}
              disabled={isSubscribing || loading}
            >
              {isSubscribing || loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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
                    className={`h-4 w-4 ${isSubscribed ? "fill-current" : ""}`}
                  />
                  <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                </div>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
