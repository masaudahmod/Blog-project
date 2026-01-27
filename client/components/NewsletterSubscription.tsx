"use client";

import { newsletterSubscribe } from "@/lib/action";
import { useEffect, useState } from "react";

interface NewsletterSubscriptionProps {
  isRow?: boolean;
  variant?: "default" | "banner";
  onSuccess?: () => void;
}

export default function NewsletterSubscription({
  isRow = false,
  variant = "default",
  onSuccess,
}: NewsletterSubscriptionProps) {
  // email state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  // form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);

      const result = await newsletterSubscribe({ email });
      if (result) {
        // reset input
        setEmail("");
        setLoading(false);
        setResultMessage(result.message || "");
        // Call onSuccess callback if provided
        if (onSuccess) {
          // Delay to show success message briefly before closing
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultMessage) {
      setTimeout(() => {
        setResultMessage("");
      }, 5000);
    }
  }, [resultMessage]);

  if (variant === "banner") {
    return (
      <>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 dark:bg-slate-900/60 border border-white/20 dark:border-white/30 text-white placeholder:text-white/60 dark:placeholder:text-white/50 outline-none focus:border-white/40 dark:focus:border-white/50 focus:ring-2 focus:ring-white/20 dark:focus:ring-white/30"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {resultMessage && (
          <span className="text-sm mt-10 font-semibold text-green-600 dark:text-green-400">
            {resultMessage || "This Email is already subscribed!"}
          </span>
        )}
      </>
    );
  }

  return (
    <div
      className={`w-full border shadow-lg rounded-lg p-5 ${isRow
          ? "flex flex-col md:flex-row items-center justify-between gap-4"
          : "flex flex-col gap-4 justify-center items-center"
        }`}
    >
      {/* Text Content */}
      <div className={`${isRow ? "md:max-w-md" : ""}`}>
        <h3 className="text-xl font-bold mb-1">Subscribe to our Newsletter</h3>
        <p className="text-sm text-secondary">
          Get latest blogs, tutorials and updates directly in your inbox.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full ${isRow
            ? "md:w-auto flex flex-col items-center gap-3"
            : "flex flex-col gap-3"
          }`}
      >
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full md:w-72 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-primary"
        />

        <button
          type="submit"
          className="w-full cursor-pointer md:w-auto bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {resultMessage && (
        <span className="mr-10 text-base font-semibold transition-all duration-200 text-green-500">
          {resultMessage || "This Email is already subscribed!"}
        </span>
      )}
    </div>
  );
}
