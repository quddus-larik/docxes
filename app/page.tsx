import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Layout, 
  Search, 
  Palette, 
  ShieldCheck, 
  Code2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { XMeta } from "@/x-meta.config";

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Zero-Core Engine",
      description: "No proprietary core packages. You own the code, you control the framework."
    },
    {
      icon: <Layout className="h-6 w-6 text-blue-500" />,
      title: "File-Based Routing",
      description: "Auto-generated navigation from your MDX/Markdown file structure."
    },
    {
      icon: <Search className="h-6 w-6 text-purple-500" />,
      title: "FlexSearch Powered",
      description: "High-performance full-text search with extremely low latency."
    },
    {
      icon: <Palette className="h-6 w-6 text-pink-500" />,
      title: "UI Marketplace",
      description: "Switch between pre-built professional themes like Shadcn, Curved, and Minimal."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
      title: "SEO Optimized",
      description: "Automatic JSON-LD schema generation for Articles and Breadcrumbs."
    },
    {
      icon: <Code2 className="h-6 w-6 text-indigo-500" />,
      title: "Deep Theming",
      description: "Custom UI components and CSS variables defined entirely in one config file."
    }
  ];

  const configContent = `import { CurvedUI } from "@/marketplace/curved-ui";
import { ShadcnUI } from "@/marketplace/shadcn-ui";
import { createConfig } from "@/lib/configuration";

export const XMeta = createConfig({
  ...ShadcnUI, // Switch themes here!
  siteName: "DocXes",
  searchProvider: "flexsearch",

  sidebar: {
    ...ShadcnUI.sidebar,
    header: undefined, 
  }
});`;

  return (
    <div className="flex flex-col bg-background overflow-y-scroll">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center lg:py-32">
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium mb-8">
            <span className="text-primary font-bold">New:</span>
            <span>FlexSearch & Shadcn UI Theme Released</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl mb-6">
            Documentation without <br className="hidden sm:block" /> 
            the <span className="text-primary">Bloat.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {XMeta.description}. Built for developers who want 100% control over their documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="rounded-full px-8 h-12 text-base" asChild>
              <Link href="/docs/v1/introduction">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" asChild>
              <Link href="https://github.com/quddus-larik/docxility" target="_blank">
                GitHub <ExternalLink className="ml-2 h-4 w-4 opacity-50" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Total UI Control Section */}
      <section className="py-24 border-y bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-6">Total UI Control. <br />No Code required.</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every visual element of your documentation is exposed as a configuration property. 
                Whether you want to tweak a CSS variable or replace an entire component with an arrow function, 
                it all happens in one place.
              </p>
              <ul className="space-y-4">
                {[
                  { label: "header", desc: "Top navigation, logo, and search bar placement." },
                  { label: "sidebar", desc: "Navigation tree, collapsible sections, and custom headers/footers." },
                  { label: "toc", desc: "Right-side 'On This Page' navigation and scroll tracking." },
                  { label: "pagination", desc: "Bottom navigation buttons for next and previous pages." },
                  { label: "theme.cssVars", desc: "Global color palette and border radii for light/dark modes." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div>
                      <code className="text-sm font-bold text-primary">{item.label}</code>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-muted/50 border p-8 flex flex-col gap-4 overflow-hidden">
                <div className="h-12 w-full rounded-xl border-2 border-dashed border-primary/30 flex items-center px-4 text-[10px] font-bold text-primary/50 uppercase tracking-widest bg-primary/5">Header Slot</div>
                <div className="flex-1 flex gap-4">
                  <div className="w-1/3 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center p-4 text-[10px] font-bold text-primary/50 uppercase tracking-widest bg-primary/5 text-center leading-relaxed">Sidebar Slot</div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 rounded-xl border bg-background p-4 flex flex-col gap-2">
                       <div className="h-2 w-1/2 rounded bg-muted"></div>
                       <div className="h-2 w-full rounded bg-muted/50"></div>
                       <div className="h-2 w-full rounded bg-muted/50"></div>
                       <div className="h-2 w-full rounded bg-muted/50"></div>
                    </div>
                    <div className="h-20 w-full rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary/50 uppercase tracking-widest bg-primary/5">Pagination Slot</div>
                  </div>
                  <div className="w-1/4 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center p-4 text-[10px] font-bold text-primary/50 uppercase tracking-widest bg-primary/5 text-center leading-relaxed">TOC Slot</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need, nothing you don't.</h2>
            <p className="text-muted-foreground">Standard features, redefined for speed and flexibility.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Config Preview Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">One File, Total Control.</h2>
            <p className="text-muted-foreground">The <code>x-meta.config.tsx</code> is your mission control for the entire site.</p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-950 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <span className="text-xs font-mono text-zinc-500">x-meta.config.tsx</span>
                <div className="w-10"></div>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-zinc-300">
                  <code>{configContent}</code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4 italic">"Finally, a framework that doesn't feel like a black box."</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg tracking-tight">DocXes</span>
            <span className="text-xs text-muted-foreground">© 2026 Lixril. Built with Docxes.</span>
          </div>
          <nav className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="https://github.com/quddus-larik" className="hover:text-primary transition-colors">GitHub</Link>
            <Link href="https://lixril.vercel.app" className="hover:text-primary transition-colors">Author</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
