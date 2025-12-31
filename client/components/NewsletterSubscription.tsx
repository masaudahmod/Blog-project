"use client";

import { useState } from "react";

export default function NewsletterSubscription({ isRow = false }) {
  // email state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // form submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // for now just log (later API call)
    console.log("Subscribed Email:", email);

    // reset input
    setEmail("");
    setLoading(false);
  };

  return (
    <div
      className={`w-full border border-gray-200 dark:border-gray-700 rounded-2xl p-5 ${
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
