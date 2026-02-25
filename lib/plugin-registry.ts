// lib/registry.ts
import { XMeta } from "@/x-meta.config";
import { ComponentName, ComponentRegistry } from "@/types/registry";

export function getPlugin<T extends ComponentName>(name: T): NonNullable<ComponentRegistry[T]> {
  const components: any = {
    sidebar: XMeta.theme?.sidebar?.component,
    TOC: XMeta.theme?.toc?.component,
    pagination: XMeta.theme?.pagination?.component,
  };

  const component = components[name];
  
  if (!component) {
    console.warn(`[DocXes] Component "${String(name)}" not found in XMeta. Falling back to default.`);
    // Return a dummy component if everything fails to prevent crash
    return (() => null) as any;
  }

  return component as NonNullable<ComponentRegistry[T]>;
}