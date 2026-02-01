"use client";

import React from "react";

interface AdmonitionProps {
  type?: "important" | "note" | "tip" | string;
  children: React.ReactNode;
}

const COLORS: Record<string, string> = {
  important: "bg-red-500 text-white",
  note: "bg-blue-500 text-white",
  tip: "bg-green-500 text-white",
};

export const Admonition: React.FC<AdmonitionProps> = ({ type = "note", children }) => {
  const badgeClass = COLORS[type.toLowerCase()] || "bg-gray-500 text-white";

  return (
    <div className="flex gap-2 p-2 rounded border border-gray-300 bg-gray-50">
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeClass}`}>
        {type.toUpperCase()}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
};
