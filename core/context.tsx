"use client";

import React, { createContext, useContext } from "react";
import { XMetaConfig } from "@/types/interface";

const XMetaContext = createContext<XMetaConfig | null>(null);

export function XMetaProvider({ 
  config, 
  children 
}: { 
  config: XMetaConfig; 
  children: React.ReactNode; 
}) {
  return (
    <XMetaContext.Provider value={config}>
      {children}
    </XMetaContext.Provider>
  );
}

export function useXMeta() {
  const context = useContext(XMetaContext);
  if (!context) {
    return null;
  }
  return context;
}
