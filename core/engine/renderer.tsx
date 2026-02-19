"use client";

import React, { useState, useEffect } from "react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";

export interface DocxesRendererProps {
  compiled: string;
  components?: Record<string, any>;
}

export function DocxesRenderer({ compiled, components }: DocxesRendererProps) {
  const [MDXContent, setMDXContent] = useState<React.ElementType | null>(null);

  useEffect(() => {
    if (!compiled) return;

    try {
      // Use new Function with no parameter name so xdm's 'arguments[0]' works correctly
      // by referring to the built-in arguments object.
      const execute = new Function(compiled);
      const result = execute({
        jsx,
        jsxs,
        Fragment,
        components,
      });

      if (result && result.default) {
        setMDXContent(() => result.default);
      }
    } catch (err) {
      console.error("Failed to execute MDX:", err);
    }
  }, [compiled, components]);

  if (!MDXContent) return null;

  return <MDXContent components={components} />;
}
