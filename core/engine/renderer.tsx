"use client";

import React, { useMemo, ReactNode } from "react";

export interface DocxesRendererProps {
  compiled: string; // This is now a JSON string of HAST
  components?: Record<string, any>;
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"
]);

/**
 * Basic CSS style string to object converter
 */
function parseStyleString(style: string): React.CSSProperties {
  const obj: any = {};
  style.split(";").forEach((pair) => {
    const [key, value] = pair.split(":");
    if (key && value) {
      const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      obj[camelKey] = value.trim();
    }
  });
  return obj;
}

export function DocxesRenderer({ compiled, components = {} }: DocxesRendererProps) {
  const content = useMemo(() => {
    if (!compiled) return null;

    try {
      const hast = JSON.parse(compiled);

      const renderNode = (node: any, index: number): ReactNode => {
        if (node.type === "text") {
          return node.value;
        }

        if (node.type === "root") {
          return (
            <React.Fragment key={index}>
              {node.children ? node.children.map((child: any, i: number) => renderNode(child, i)) : null}
            </React.Fragment>
          );
        }

        if (node.type === "element") {
          const { tagName, properties, children } = node;
          const Tag = components[tagName] || tagName;

          // Convert properties to React-compatible props
          const props: Record<string, any> = { ...properties };
          
          if (props.class) {
            props.className = Array.isArray(props.class) ? props.class.join(" ") : props.class;
            delete props.class;
          }

          if (typeof props.style === "string") {
            props.style = parseStyleString(props.style);
          }

          if (VOID_ELEMENTS.has(tagName)) {
            return <Tag key={index} {...props} />;
          }

          return (
            <Tag key={index} {...props}>
              {children ? children.map((child: any, i: number) => renderNode(child, i)) : null}
            </Tag>
          );
        }

        if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
          const Tag = node.name ? (components[node.name] || node.name) : React.Fragment;
          const props: Record<string, any> = {};
          
          if (node.attributes) {
            node.attributes.forEach((attr: any) => {
              if (attr.type === "mdxJsxAttribute") {
                props[attr.name] = attr.value;
              }
            });
          }

          if (props.class) {
            props.className = props.class;
            delete props.class;
          }

          // MDX components are usually not void elements in MDX
          return (
            <Tag key={index} {...props}>
              {node.children ? node.children.map((child: any, i: number) => renderNode(child, i)) : null}
            </Tag>
          );
        }

        return null;
      };

      return renderNode(hast, 0);
    } catch (err) {
      console.error("Failed to render HAST MDX:", err);
      return <div className="text-red-500">Error rendering document: {(err as any).message}</div>;
    }
  }, [compiled, components]);

  // Use Fragment instead of div to avoid nesting issues if Renderer is used inside another block
  return <>{content}</>;
}
