"use client";

import { useState } from "react";
import NewsletterModal from "./NewsletterModal";

export default function NewsletterSubscribeButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 w-full cursor-pointer rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900"
      >
        Subscribe
      </button>
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
