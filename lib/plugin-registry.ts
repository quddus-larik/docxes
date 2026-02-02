// lib/registry.ts
import { XMeta } from "@/x-meta.config";
import { ComponentName, ComponentRegistry } from "@/types/registry";

export function getPlugin<T extends ComponentName>(name: T): NonNullable<ComponentRegistry[T]> {
  const components = XMeta.interface.components;
  if (!components) {
      throw new Error("Component registry is missing in XMeta config");
  }
  const component = components[name];
  
  if (!component) {
    throw new Error(`Component ${name} not found in XMeta registry`);
  }

  return component as NonNullable<ComponentRegistry[T]>;
}