"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// ReactQuill must be imported dynamically when using Next.js + TS
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EditorProps {
  value: string | undefined | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export default function Editor({ value, onChange, className }: EditorProps) {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "code-block"],
    ],
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "image",
    "code-block",
  ];

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value as string}
        onChange={onChange}
        className={className}
      />
    </div>
  );
}
