"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  className?: string;
  children: React.ReactNode;
}

export const CodeBlock: React.FC<PreProps> = ({ className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      const text = preRef.current.innerText; // get actual text from DOM
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full bg-muted p-1 rounded-sm my-1">
      <pre
        ref={preRef}
        className={className || "rounded bg-green px-1 py-0.5 text-sm"}
        {...props}
      >
        {children} {props.title}
      </pre>
      <Button
        size="icon-sm"
        variant="outline"
        className="absolute top-1 right-1 flex items-center gap-1 z-10"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
};
