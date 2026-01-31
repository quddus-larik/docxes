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
// import { MdxTabsCode } from "./mdx-tabs-code";
import { Admonition } from "./admonition";
import { Step, StepsWithCounter, StepsConnected, CodeStep } from "@/components/mdx-steps";

function getText(children: React.ReactNode | any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getText).join("");
  if (typeof children === "object" && children && "props" in children) {
    return getText(children.props.children);
  }
  return "";
}

// Get Headings
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

  a: ({ href, children }: any) => {
    const isExternal = href?.startsWith("http");

    return (
      <a
        href={href}
        className="
          text-black
          underline
          underline-offset-4
          hover:font-semibold
          transition
        "
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
    <ul className="my-6 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-6 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,

  blockquote: ({ children }: any) => (
    <blockquote className="my-6 border-l-4 pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  pre: (props: any) => {
  return <CodeBlock {...props} />;
},

  code: ({ className, ...props }: any) => {
    // single line
    if (!className) {
      return (
        <code
          className="rounded bg-muted px-1 py-0.5 text-sm"
          {...props}
        />
      );
    }

    // BLOCK code → let <pre> handle it
    return <code {...props} />;
  },

  figcaption: () => null,

  table: MdxTable,

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

  Important: (props: any) => <Admonition type="important" {...props} />,
  Note: (props: any) => <Admonition type="note" {...props} />,
  Tip: (props: any) => <Admonition type="tip" {...props} />,
};
