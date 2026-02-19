"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  className?: string;
  children: React.ReactNode;
}

export const CodeBlock: React.FC<PreProps> = ({
  className,
  children,
  style,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-md border my-2 overflow-hidden group">
      <pre
        ref={preRef}
        style={style}
        className="p-2"
        {...props}
      >
        {children}
      </pre>

      <Button
        size="icon"
        variant="outline"
        className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
