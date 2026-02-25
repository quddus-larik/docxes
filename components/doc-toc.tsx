"use client";

import React from "react";
import type { DocHeading } from "@/core/engine";
import { useDocTOC } from "@/hooks/useTOC";
import { useXMeta } from "@/lib/config-context";

interface DocTOCProps {
  headings: DocHeading[];
}

export function DocTOC({ headings }: DocTOCProps) {
  const { activeId, hierarchy, scrollToHeading } = useDocTOC(headings);
  const config = useXMeta();

  if (!config) return null;
  const { Container, Item } = config.theme.toc;

  if (!headings.length) return null;

  const renderItems = (items: any[], depth = 0) => (
    <>
      {items.map((item, index) => {
        const active = activeId === item.heading.id;
        const onClick = () => scrollToHeading(item.heading.id);

        return (
          <React.Fragment key={item.heading.id}>
            <div onClick={onClick} className="cursor-pointer">
              <Item
                item={item.heading}
                index={index}
                isActive={active}
              />
            </div>
            {item.children.length > 0 && renderItems(item.children, depth + 1)}
          </React.Fragment>
        );
      })}
    </>
  );

  return (
    <Container headings={headings}>
      {renderItems(hierarchy)}
    </Container>
  );
}
