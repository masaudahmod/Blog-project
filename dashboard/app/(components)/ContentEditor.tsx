"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EditorProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function Editor({ value, onChange, className, placeholder }: EditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }], // Headings like Dev.to
      ["bold", "italic", "underline", "strike"], 
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"], // Important for Dev blogs
      ["link", "image"],
      ["clean"], // Clear formatting button
    ],
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <style jsx global>{`
        /* Quill-er default border remove kora professional look er jonno */
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #27272a !important; /* zinc-800 */
          background: #fafafa;
        }
        .dark .ql-toolbar.ql-snow {
          background: #09090b;
          border-bottom: 1px solid #27272a !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 300px;
        }
        .ql-editor.ql-blank::before {
          color: #71717a;
          font-style: normal;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Write your story..."}
        className={className}
      />
    </div>
  );
}