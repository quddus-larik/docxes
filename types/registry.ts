// types/registry.ts
import type { InterfaceComponents } from "@/types/interface";
import type React from "react";

export type ComponentRegistry = InterfaceComponents;
export type ComponentName = keyof ComponentRegistry;

// Extract props for a specific component automatically
export type ComponentProps<T extends ComponentName> = 
  React.ComponentProps<NonNullable<ComponentRegistry[T]>>;