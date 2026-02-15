"use client";

import React from "react";
import { cn } from "@/lib/utils";

const StepContext = React.createContext<number | null>(null);


interface StepItemProps {
  children: React.ReactNode;
  className?: string;
}

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

interface CodeStepProps {
  children: React.ReactNode;
  lines?: string;
  className?: string;
}

function StepLayout({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-start gap-4">
      {/* Badge */}
      <div className="relative z-10 shrink-0 mt-1">
        <div
          className={cn(
            "flex h-9 min-w-9 px-3 items-center justify-center",
            "rounded-lg text-sm font-semibold",
            "bg-primary text-primary-foreground",
            "border border-border/50"
          )}
        >
          {number}
        </div>
      </div>

      <div className="flex-1 [&>*:first-child]:mt-0">
        {children}
      </div>
    </div>
  );
}


export function Step({ children, className }: StepItemProps) {
  const stepNumber = React.useContext(StepContext);
  if (stepNumber === null) return null;

  return (
    <div className={cn("relative", className)}>
      <StepLayout number={stepNumber}>{children}</StepLayout>
    </div>
  );
}


export function StepsWithCounter({ children, className }: StepsProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={cn("my-2", className)}>
      {items.map((child, index) => (
        <StepContext.Provider key={`step-${index}`} value={index + 1}>
          {child}
        </StepContext.Provider>
      ))}
    </div>
  );
}


export function StepsConnected({ children, className }: StepsProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={cn("my-8 space-y-6", className)}>
      {items.map((child, index) => (
        <StepContext.Provider key={`step-${index}`} value={index + 1}>
          <div className="relative">
            {/* Vertical connector line aligned to curved badge */}
            {index < items.length - 1 && (
              <div className="absolute left-[18px] top-10 h-full w-px bg-border" />
            )}

            <StepLayout number={index + 1}>{child}</StepLayout>
          </div>
        </StepContext.Provider>
      ))}
    </div>
  );
}


export function CodeStep({ children, lines, className }: CodeStepProps) {
  const highlightedLines = React.useMemo(() => {
    if (!lines) return [];

    const out: number[] = [];

    for (const part of lines.split(",")) {
      if (part.includes("-")) {
        const [s, e] = part.split("-").map(Number);
        for (let i = s; i <= e; i++) out.push(i);
      } else {
        out.push(Number(part));
      }
    }

    return out;
  }, [lines]);

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30 p-3",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        if ("highlightedLines" in (child.props as any)) {
          return React.cloneElement(child, {
            highlightedLines,
          } as any);
        }

        return child;
      })}
    </div>
  );
}
