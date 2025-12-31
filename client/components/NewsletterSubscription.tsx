"use client";

import { newsletterSubscribe } from "@/lib/action";
import { useEffect, useState } from "react";

export default function NewsletterSubscription({ isRow = false }) {
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

  return (
    <div
      className={`w-full border shadow-lg rounded-lg p-5 ${
        isRow
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
        className={`w-full ${
          isRow
            ? "md:w-auto flex flex-col md:flex-row items-center gap-3"
            : "flex flex-col gap-3"
        }`}
      >
        {resultMessage && (
          <span className="mr-10 text-base font-semibold transition-all duration-200 text-green-500">
            {resultMessage || "This Email is already subscribed!"}
          </span>
        )}

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
    </div>
  );
}
