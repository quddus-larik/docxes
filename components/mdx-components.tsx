import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import { MdxTable } from "./mdx-table"
import { MdxTabsCode } from "./mdx-tabs-code"


interface CustomCardProps {
  title: string
  description?: string
  children?: React.ReactNode
  variant?: "default" | "secondary" | "outline"
}

export const MdxCard: React.FC<CustomCardProps> = ({
  title,
  description,
  children,
  variant = "default",
}) => {
  return (
    <Card
      className={cn(
        "my-6",
        variant === "secondary" && "bg-secondary",
        variant === "outline" && "border-dashed"
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </CardContent>
    </Card>
  )
}

/* -------------------- ALERT -------------------- */

interface CustomAlertProps {
  title: string
  type?: "info" | "warning" | "success" | "error"
  children?: React.ReactNode
}

const alertStyles = {
  info: {
    icon: <Info className="h-4 w-4" />,
    className: "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "border-green-200 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    className: "border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  },
}

export const MdxAlert: React.FC<CustomAlertProps> = ({
  title,
  type = "info",
  children,
}) => {
  const style = alertStyles[type]

  return (
    <Alert className={cn("my-6", style.className)}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="space-y-1">
          <AlertTitle className="font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">
            {children}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/* -------------------- BADGE -------------------- */

interface CustomBadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive"
}

export const MdxBadge: React.FC<CustomBadgeProps> = ({
  children,
  variant = "default",
}) => {
  return (
    <Badge variant={variant} className="mx-1 align-middle">
      {children}
    </Badge>
  )
}

/* -------------------- MDX MAP -------------------- */

export const mdxComponents = {
  MdxCard,
  MdxAlert,
  MdxBadge,
  CodeBlock,
  MdxTable,
  MdxTabsCode,
}
