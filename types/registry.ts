import type React from "react";

export interface ComponentRegistry {
  sidebar?: React.ComponentType<any>;
  sidebarHeader?: React.ComponentType<any>;
  sidebarFooter?: React.ComponentType<any>;
  pagination?: React.ComponentType<any>;
  TOC?: React.ComponentType<any>;
  TOCHeader?: React.ComponentType<any>;
  TOCFooter?: React.ComponentType<any>;
  button?: React.ComponentType<any>;
}

export type ComponentName = keyof ComponentRegistry;

// Extract props for a specific component automatically
export type ComponentProps<T extends ComponentName> = 
  React.ComponentProps<NonNullable<ComponentRegistry[T]>>;