"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import TinyMCE React wrapper (SSR disabled)
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Loading editor...
          </p>
        </div>
      </div>
    ),
  }
);

interface EditorProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  className,
  placeholder = "Write your content here...",
}: EditorProps) {
  const editorRef = useRef<{ getContent: () => string } | null>(null);

  // Get API key from environment variable (client-side)
  // If no API key is set, TinyMCE will show a warning but still work in read-only mode
  // For production, get a free API key from: https://www.tiny.cloud/auth/signup/
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "";

  // Handle editor change - this is called whenever content changes
  const handleEditorChange = (content: string) => {
    // Call the onChange callback with the updated content
    onChange(content);
  };

  // Detect if dark mode is enabled on the page
  const isDarkMode =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");


  return (
    <div
      className={`bg-green-500 dark:bg-orange-500 rounded-xl border-none overflow-hidden ${className || ""
        }`}
    >
      <Editor
      key={isDarkMode ? "dark-editor" : "light-editor"}
        apiKey={apiKey}
        licenseKey={apiKey ? undefined : "gpl"}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value || ""}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: false,
          placeholder: placeholder,
          plugins: [
            "lists",
            "link",
            "image",
            "code",
            "blockquote",
            "paste",
            "help",
            "wordcount",
            "autoresize",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | " +
            "bullist numlist blockquote code | " +
            "link image | removeformat | help",
          content_style: `
            body {
              font-family: Inter, system-ui, -apple-system, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              background: transparent;
              color: inherit;
              margin: 16px;
              height: 400px;
              background: ${isDarkMode ? "#0f172a" : "#ffffff"} !important;
              color: ${isDarkMode ? "#e2e8f0" : "#0f172a"} ;
            }
            p {
              margin: 0 0 12px 0;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 16px 0 8px 0;
              font-weight: 600;
            }
            ul, ol {
              margin: 8px 0;
              padding-left: 24px;
            }
            blockquote {
              margin: 16px 0;
              padding-left: 16px;
              border-left: 4px solid ${isDarkMode ? "#334155" : "#e5e7eb"};
            }
            code {
              background: ${isDarkMode ? "#334155" : "#f3f4f6"};
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
            }
          `,
          skin: isDarkMode ? "oxide-dark" : "oxide",
          content_css: isDarkMode ? "dark" : "default",
          branding: false,
          promotion: false,
          // Auto-resize to content
          autoresize_bottom_margin: 16,
          autoresize_overflow_padding: 16,
          // Paste settings
          paste_as_text: false,
          paste_auto_cleanup_on_paste: true,
          paste_remove_styles: true,
          paste_remove_styles_if_webkit: true,
          paste_strip_class_attributes: "all",
          // Image settings
          image_advtab: true,
          image_caption: true,
          // Link settings
          link_title: false,
          // Accessibility
          accessibility_focus: true,
          // Word count
          wordcount_countregex: /[\w\u2019\'-]+/g,
        } as Record<string, unknown>}
      />
    </div>
  );
}
