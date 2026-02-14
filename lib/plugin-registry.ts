// lib/registry.ts
import { XMeta } from "@/x-meta.config";
import { ComponentName, ComponentRegistry } from "@/types/registry";

export function getPlugin<T extends ComponentName>(name: T): NonNullable<ComponentRegistry[T]> {
  const components: any = {
    sidebar: XMeta.sidebar?.component,
    TOC: XMeta.toc?.component,
    pagination: XMeta.pagination?.component,
    button: XMeta.button,
  };

  const component = components[name];
  
  if (!component) {
    throw new Error(`Component ${String(name)} not found in XMeta registry`);
  }

  return component as NonNullable<ComponentRegistry[T]>;
}