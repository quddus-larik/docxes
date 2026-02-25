"use client"

import React from "react";
import { ChevronDown } from "lucide-react";
import type { DocNavItem } from "@/core/engine";
import { useDocSidebar } from "@/hooks/useSidebar";
import { useFramework } from "@/core/framework";
import { useXMeta } from "@/core/context";

interface DocSidebarProps {
  version: string;
  currentPath: string;
  items?: DocNavItem[];
  versions?: string[];
}

export function DocSidebar({
  version,
  currentPath,
  items: initialItems,
  versions: initialVersions,
}: DocSidebarProps) {
  const {
    expandedItems,
    toggleExpanded,
    items: hookItems,
    versions: hookVersions,
    isActive,
    shouldExpand,
    getItemId,
  } = useDocSidebar(version, currentPath, initialItems, initialVersions);

  const config = useXMeta();
  
  if (!config) {
     return null; // Or some fallback
  }

  const items = initialItems || hookItems;
  const versions = initialVersions || hookVersions;

  const { Container, Item, Group } = config.theme.sidebar;

  const RenderNavItems = ({ items, depth = 0 }: { items: DocNavItem[]; depth?: number }) => (
    <>
      {items.map((item) => {
        const expanded = expandedItems.has(getItemId(item)) || shouldExpand(item);
        const hasChildren = !!item.items?.length;
        const active = isActive(item.href);
        const onToggle = () => toggleExpanded(getItemId(item));

        if (hasChildren) {
          return (
            <Group
              key={getItemId(item)}
              item={item}
              isOpen={expanded}
              onToggle={onToggle}
              depth={depth}
            >
              <RenderNavItems items={item.items!} depth={depth + 1} />
            </Group>
          );
        }

        return (
          <Item
            key={getItemId(item)}
            item={item}
            href={item.href}
            isActive={active}
            depth={depth}
          />
        );
      })}
    </>
  );

  return (
    <Container version={version} versions={versions as string[]} items={items}>
      <RenderNavItems items={items} />
    </Container>
  );
}
