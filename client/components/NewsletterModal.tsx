"use client";

import { useEffect, useState } from "react";
import NewsletterSubscription from "./NewsletterSubscription";
import { X } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-lg rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-xl  dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-1 top-1 sm:right-4 sm:top-4 rounded-full p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors touch-manipulation"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Newsletter Component */}
        <div className="mt-1 sm:mt-2">
          <NewsletterSubscription variant="default" onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
