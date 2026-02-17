"use client";

import React from "react";
// We export a generic interface. In a real non-Next.js environment, 
// you might swap this with @mdx-js/react or a custom runtime.
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";

export interface DocxesRendererProps {
  compiled: MDXRemoteProps;
  components?: Record<string, any>;
}

export function DocxesRenderer({ compiled, components }: DocxesRendererProps) {
  if (!compiled) return null;
  
  return (
    <MDXRemote {...compiled} components={components} />
  );
}
