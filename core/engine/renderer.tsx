"use client";

import React from "react";
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
