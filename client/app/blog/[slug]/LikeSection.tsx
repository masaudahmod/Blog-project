"use client";

import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  checkLikeStatus,
  getLikeCount,
  likePost,
  logActivity,
  unlikePost,
} from "@/lib/action";
import { getDeviceInfo, getUserIdentifier } from "@/lib/userIdentifier";

interface LikeSectionProps {
  postId: number;
  initialCount: number;
}

export default function LikeSection({ postId, initialCount }: LikeSectionProps) {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const hasLoggedView = useRef(false);

  useEffect(() => {
    setUserIdentifier(getUserIdentifier());
  }, []);

  useEffect(() => {
    if (!postId || !userIdentifier) return;

    const loadLikeState = async () => {
      try {
        const [hasLiked, count] = await Promise.all([
          checkLikeStatus({ post_id: postId, user_identifier: userIdentifier }),
          getLikeCount(postId),
        ]);
        setLiked(hasLiked);
        setLikeCount(count);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    loadLikeState();
  }, [postId, userIdentifier]);

  useEffect(() => {
    if (!postId || !userIdentifier || hasLoggedView.current) return;
    hasLoggedView.current = true;
    logActivity({
      post_id: postId,
      user_identifier: userIdentifier,
      action_type: "view",
      device_info: getDeviceInfo(),
    });
  }, [postId, userIdentifier]);

  const handleLikeToggle = async () => {
    if (!postId || !userIdentifier) return;

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);
    setLoading(true);

    try {
      if (prevLiked) {
        const result = await unlikePost({
          post_id: postId,
          user_identifier: userIdentifier,
        });
        if (!result.success) throw new Error("Failed to unlike");
      } else {
        const result = await likePost({
          post_id: postId,
          user_identifier: userIdentifier,
        });
        if (!result.success) throw new Error("Failed to like");

        logActivity({
          post_id: postId,
          user_identifier: userIdentifier,
          action_type: "like",
          device_info: getDeviceInfo(),
        });
      }

      const count = await getLikeCount(postId);
      setLikeCount(count);
    } catch (error) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      alert("Failed to update like");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleLikeToggle}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
            liked
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <Heart className={liked ? "fill-red-500 text-red-500" : ""} size={18} />
          {liked ? "Liked" : "Like"}
        </button>
        <p className="text-sm text-slate-600">
          {likeCount} {likeCount === 1 ? "person" : "people"} liked this post
        </p>
      </div>
      <p className="text-xs text-slate-400">Tap the heart if this post helped.</p>
    </div>
  );
}
