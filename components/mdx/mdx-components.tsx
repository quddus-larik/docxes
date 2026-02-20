

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { CodeBlock } from "./code-block";
import { MdxTable } from "./mdx-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Step,
  StepsWithCounter,
  StepsConnected,
  CodeStep,
} from "@/components/mdx/mdx-steps";

function getText(children: React.ReactNode | any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getText).join("");
  if (typeof children === "object" && children && "props" in children) {
    return getText(children.props.children);
  }
  return "";
}


const Heading = (Tag: React.ElementType, className: string) => {
  return ({ children, ...props }: any) => {
    const text = getText(children);
    const id = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    return (
      <Tag
        id={id}
        {...props}
        className={cn("scroll-mt-24", className, props.className)}
      >
        {children}
      </Tag>
    );
  };
};

// MDX Components
export const mdxComponents = {
  h1: Heading("h1", "mt-8 text-4xl font-bold tracking-tight"),
  h2: Heading(
    "h2",
    "mt-10 border-b pb-2 text-2xl font-semibold tracking-tight",
  ),
  h3: Heading("h3", "mt-8 text-xl font-semibold tracking-tight"),
  h4: Heading("h4", "mt-6 text-lg font-semibold"),
  h5: Heading("h5", "mt-4 text-base font-semibold"),
  h6: Heading("h6", "mt-4 text-sm font-semibold"),

  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith("http");

    return (
      <a
        href={href}
        className={cn(
          "font-medium text-primary underline underline-offset-4 decoration-primary/30 transition-all hover:decoration-primary hover:text-primary/80",
          isExternal &&
            "after:content-['↗'] after:ml-0.5 after:text-[0.8em] after:no-underline",
        )}
        {...props}
      >
        {children}
      </a>
    );
  },

  p: ({ children }: any) => (
    <p className="leading-7 not-first:mt-2">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic">{children}</em>,

  ul: ({ children }: any) => (
    <ul className="my-6 ml-6 list-disc space-y-2">
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;

        // Stable key: prefer child.props.id/name, fallback to i
        const stableKey = child.key ?? i;

        return React.cloneElement(child, { key: stableKey } as any);
      })}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-6 ml-6 list-decimal space-y-2">
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { key: i } as any)
          : child,
      )}
    </ol>
  ),
  li: ({ children, ...props }: any) => <li {...props}>{children}</li>,

  blockquote: ({ children }: any) => (
    <blockquote className="my-6 border-l-4 pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  figure: ({ children, ...props }: any) => {
    return (
      <figure {...props} className={cn("my-6", props.className)}>
        {children}
      </figure>
    );
  },

  pre: ({children , ...props}: any) => {
    return <CodeBlock children={children} {...props} />
  },

  img: (props: any) => {
    return (
      <span className="block w-full bg-muted rounded-md overflow-hidden my-4">
        <img
          src={props.src}
          alt={props.alt || ""}
          className="w-full h-auto"
          {...props}
        />
        {props.alt && (
          <span className="block px-2 py-1 font-semibold text-xs text-muted-foreground">
            {props.alt}
          </span>
        )}
      </span>
    );
  },

  code: ({ className, ...props }: any) => {
    // single line
    if (!className) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 text-sm" {...props} />
      );
    }

    // BLOCK code → let <pre> handle it
    return <code {...props} />;
  },

  figcaption: () => null,

  table: MdxTable,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  MdxTable,
  Highlight: ({ className, children }: any) => (
    <span className={cn("h-full bg-pink-300",className)}>{children}</span>
  ),

  MdxCard: ({ title, description, children, variant = "default" }: any) => (
    <Card
      className={cn(
        "my-6",
        variant === "secondary" && "bg-secondary",
        variant === "outline" && "border-dashed",
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </CardContent>
    </Card>
  ),

  MdxAlert: ({
    title,
    type = "info",
    children,
  }: {
    title: string;
    type: string;
    children: any;
  }) => {
    const style: any = {
      info: {
        icon: <Info className="h-4 w-4" />,
        className: "border-blue-200 bg-blue-50 dark:bg-blue-950",
      },
      warning: {
        icon: <AlertTriangle className="h-4 w-4" />,
        className: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950",
      },
      success: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: "border-green-200 bg-green-50 dark:bg-green-950",
      },
      error: {
        icon: <AlertCircle className="h-4 w-4" />,
        className: "border-red-200 bg-red-50 dark:bg-red-950",
      },
    }[type];

    return (
      <Alert className={cn("my-6", style.className)}>
        {style.icon}
        <div className="flex flex-col gap-2">
          <AlertTitle className="font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-sm w-full">
            {children}
          </AlertDescription>
        </div>
      </Alert>
    );
  },

  MdxBadge: ({ children, variant = "default" }: any) => (
    <Badge variant={variant} className="mx-1 align-middle">
      {children}
    </Badge>
  ),

  // MdxTabsCode,

  Step,
  StepsWithCounter,
  StepsConnected,
  CodeStep,
};
