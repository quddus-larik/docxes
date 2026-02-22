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
      title: "MDX Support",
      description: "Powered by MDX JS support rehype highlighters, remarkGfm and shiki."
    },
    {
      icon: <Layout className="h-6 w-6 text-blue-500" />,
      title: "File-Based Routing",
      description: "Auto-generated navigation from your MDX/Markdown file structure."
    },
    {
      icon: <Search className="h-6 w-6 text-purple-500" />,
      title: "Search Plugins",
      description: "Performanced text search with extremely low latency with any search providers."
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

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center lg:py-32 lg:h-svh">
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-yellow-100 dark:bg-yellow-600 dark:border-yellow-100 border-yellow-600 px-4 py-1 text-sm font-medium mb-8">
            <span className="text-primary text-lg font-bold">!</span>
            <span>In Development</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl mb-6">
            Documentation without <br className="hidden sm:block" /> 
            the <span className="text-primary">Bloat.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {XMeta.description} That support React Frameworks (Nextjs, Remix, React Router, Astro React)
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
