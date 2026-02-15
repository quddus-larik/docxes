"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter, usePathname } from "next/navigation"
import { SearchDialog } from "./search-dialog"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"
import { XMeta } from "@/x-meta.config"
import { HeaderProps } from "@/types/interface"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Configuration",
    href: "/docs/v1/guides/configuration",
    description: "Learn how to configure your documentation site via x-meta.config.tsx.",
  },
  {
    title: "Customization",
    href: "/docs/v1/guides/customizing-ui",
    description: "Deep dive into theme customization and headless Tailwind styles.",
  },
  {
    title: "Theming",
    href: "/docs/v1/core-concepts/theming-engine",
    description: "Manage colors, typography, and visual styles across your site.",
  },
  {
    title: "Components",
    href: "/docs/v1/reference/components",
    description: "Explore the built-in MDX components available for your content.",
  },
]


function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="text-muted-foreground line-clamp-2">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}


export function Header({ siteName, className, versions }: HeaderProps) {
  const { toggle } = useSidebar();
  const ModeToggle = XMeta.modeToggle;
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentVersion = (params.version as string) || (versions && versions.length > 0 ? versions[versions.length - 1] : "");

  const handleVersionChange = (newVersion: string) => {
    if (pathname.startsWith('/docs/')) {
      const parts = pathname.split('/');
      // parts[0] is empty, parts[1] is 'docs', parts[2] is version
      if (parts.length >= 3) {
        parts[2] = newVersion;
        router.push(parts.join('/'));
        return;
      }
    }
    router.push(`/docs/${newVersion}`);
  };
  
  return (
    <header className={cn("sticky top-0 w-full border-b bg-background/95 z-50 backdrop-blur supports-backdrop-filter:bg-background/60", className)}>
      <div className="container mx-auto flex h-14 items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={toggle}
              aria-label="Toggle Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="hidden md:flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap">
                {siteName}
              </span>
            </Link>
            
            
          </div>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href={`/docs/${currentVersion}/getting-started/introduction`} title="Introduction">
                      Learn about DocXes, the modern documentation framework.
                    </ListItem>
                    <ListItem href={`/docs/${currentVersion}/getting-started/installation`} title="Quick Start">
                      Get up and running with your own documentation in minutes.
                    </ListItem>
                    <ListItem href={`/docs/${currentVersion}/core-concepts/architecture`} title="Architecture">
                      Understand how DocXes works under the hood.
                    </ListItem>
                    <ListItem href={`/docs/${currentVersion}/core-concepts/routing`} title="Routing">
                      Learn about file-system routing and versioning.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Guides</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href.replace('v1', currentVersion)}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                  <Link href="/docs">
                    Docs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-full max-w-[300px] lg:max-w-[400px]">
            <SearchDialog />
          </div>
          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <SearchDialog />
            </div>
            {ModeToggle && <ModeToggle />}
          </div>
        </div>
      </div>
    </header>
  )
}
