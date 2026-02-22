"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  className?: string;
  children: React.ReactNode;
  "data-language"?: string; 
}

export const CodeBlock: React.FC<PreProps> = ({
  className,
  children,
  style,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const language = props["data-language"];

  const handleCopy = () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-md border overflow-hidden group">
      {language && (
        <div className="absolute top-2 left-4 z-10 text-[10px] uppercase font-bold text-muted-foreground tracking-widest opacity-40">
          {language}
        </div>
      )}
      <pre
        ref={preRef}
        className={cn(
          "max-h-[650px] overflow-x-auto py-6 text-sm leading-relaxed w-full px-4",
          className,
        )}
        style={style}
        {...props}
      >
        {React.cloneElement(children as React.ReactElement, { isCodeBlock: true })}
      </pre>

      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/30"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};
