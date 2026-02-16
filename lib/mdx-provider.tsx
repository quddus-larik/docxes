"use client";

import { DocxesRenderer } from "@/core/engine/renderer";
import { mdxComponents } from "@/components/mdx/mdx-components";

interface AppMDXProviderProps {
  compiled: any;
}

export function AppMDXProvider({ compiled }: AppMDXProviderProps) {
  return (
    <DocxesRenderer
      compiled={compiled}
      components={mdxComponents}
    />
  );
}
