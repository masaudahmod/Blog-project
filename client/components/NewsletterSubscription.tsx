"use client";

import { newsletterSubscribe } from "@/lib/action";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface NewsletterSubscriptionProps {
  isRow?: boolean;
  variant?: "default" | "banner" | "modal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);
      setHasError(false);

      const result = await newsletterSubscribe({ email });
      if (result) {
        // reset input
        setEmail("");
        setLoading(false);
        setResultMessage(result.message || "");
        setHasError(false);

        // Call onSuccess callback if provided
        if (onSuccess) {
          // Delay to show success message briefly before closing
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }

        // For modal variant, close modal on success after delay
        if (variant === "modal") {
          setTimeout(() => {
            setIsModalOpen(false);
            setResultMessage("");
          }, 2000);
        }
      } else {
        setLoading(false);
        setHasError(true);
        setResultMessage("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setLoading(false);
      setHasError(true);
      setResultMessage("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (resultMessage && !hasError) {
      setTimeout(() => {
        setResultMessage("");
      }, 5000);
    }
  }, [resultMessage, hasError]);


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail("");
    setResultMessage("");
    setHasError(false);
  };

  // Handle modal close on scroll/wheel/touch (detect scroll attempts)
  useEffect(() => {
    if (isModalOpen && variant === "modal") {
      const handleScroll = () => {
        handleCloseModal();
      };

      const handleWheel = (e: WheelEvent) => {
        // Close if scrolling outside modal content (on backdrop)
        const target = e.target as HTMLElement;
        const modalContent = target.closest('.newsletter-modal-content');
        if (!modalContent) {
          handleCloseModal();
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        // Close if touch move is outside modal content (on backdrop)
        const target = e.target as HTMLElement;
        const modalContent = target.closest('.newsletter-modal-content');
        if (!modalContent) {
          handleCloseModal();
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("wheel", handleWheel, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [isModalOpen, variant]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen && variant === "modal") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, variant]);

  // Handle escape key for modal
  useEffect(() => {
    if (isModalOpen && variant === "modal") {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsModalOpen(false);
          setEmail("");
          setResultMessage("");
          setHasError(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isModalOpen, variant]);

  // Modal variant - CTA button that opens modal
  if (variant === "modal") {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 cursor-pointer bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-base md:text-lg"
        >
          Join Newsletter
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
              className="newsletter-modal-content relative z-10 w-full max-w-md rounded-xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Modal Form */}
              <div className="mt-2">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">
                  Subscribe to Newsletter
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Enter your email to get the latest updates.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>

                  {resultMessage && (
                    <div
                      className={`text-sm font-medium text-center py-2 px-4 rounded-lg ${hasError
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                        }`}
                    >
                      {resultMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

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
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-white/20 text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {resultMessage && (
          <span className="text-sm mt-10 font-semibold text-green-600">
            {resultMessage || "This Email is already subscribed!"}
          </span>
        )}
      </>
    );
  }

  return (
    <div
      className={`w-full rounded-lg p-5 ${isRow
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
          className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-transparent outline-none focus:border-primary"
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
