"use client";

import { Button } from "@/components/ui/button";
import { likePost } from "@/lib/action";
import { useState } from "react";
import { toast } from "sonner";

type LikedComponentProps = {
  slug: string;
  initialLikes: number;
};

export default function LikedComponent({
  slug,
  initialLikes,
}: LikedComponentProps) {
  // ✅ lazy initializer (NO useEffect)
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const likedPosts: string[] = JSON.parse(
        localStorage.getItem("likedPosts") ?? "[]"
      );
      return likedPosts.includes(slug);
    } catch {
      return false;
    }
  });

  const [likes, setLikes] = useState(initialLikes);

  const handleLikeToggle = async () => {
    const prevLiked = liked;

    // 🔥 optimistic UI
    setLiked(!prevLiked);
    setLikes((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      const likedPosts: string[] = JSON.parse(
        localStorage.getItem("likedPosts") ?? "[]"
      );

      const updated = prevLiked
        ? likedPosts.filter((s) => s !== slug)
        : [...likedPosts, slug];

      localStorage.setItem("likedPosts", JSON.stringify(updated));

      await likePost(slug);
    } catch (error) {
      // ❌ rollback
      setLiked(prevLiked);
      setLikes((prev) => (prevLiked ? prev + 1 : prev - 1));
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      <Button
        className="flex items-center gap-2 active:scale-95 transition"
        aria-label="Like post"
        onClick={handleLikeToggle}
      >
        {liked ? (
          // ❤️ filled heart
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="red"
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        ) : (
          // 🤍 empty heart
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        )}
      </Button>

      <span className="text-sm text-slate-600 dark:text-slate-400">
        {likes} people liked this
      </span>
    </div>
  );
}
