# Engine Working Documentation

## Overview
DocXes is a **dynamic documentation engine** built with TypeScript, React, and Next.js. It provides a modular framework for rendering documentation with support for multiple frameworks and customizable UI components.

---

## Core Directory Structure (`@core/`)

### 1. **Framework Abstraction Layer**
- **`framework.tsx`** - Base interface for framework-agnostic routing
  - Defines `DocxesFramework` interface with:
    - `Link` component (for navigation)
    - `useRouter()` hook (push, replace, back, forward)
    - `usePathname()` hook (current path)
    - `useParams()` hook (route parameters)
  - Context provider for injecting framework implementation

- **`next-framework.tsx`** - Next.js implementation
  - Implements `NextFramework` adapter using Next.js routing APIs
  - Provides `getStaticParams()` for static generation
  - Maps Next.js router/navigation to `DocxesFramework` interface

- **`react-router-framework.tsx`** - React Router stub (for future Vite/Remix support)
  - Currently placeholder with TODO comment
  - Ready for implementation if needed

---

### 2. **Configuration System**
- **`configuration.tsx`** - Central configuration management
  - Defines `createConfig()` function with sensible defaults
  - Configurable options:
    - `framework`: "nextjs" (default)
    - `siteName`, `description`, `siteUrl`
    - `contentDir`: "content/docs"
    - `versions`: Support for versioning
    - `search`: Search feature toggle
    - `theme`: MDX components, syntax highlighting, sidebar, TOC, pagination
  - Merges user overrides with defaults
  - Default syntax highlighting: `rehype-pretty-code` with GitHub Light/One Dark Pro themes

---

### 3. **Context Providers**
- **`context.tsx`** - React context for configuration
  - `XMetaProvider`: Wraps app with config context
  - `useXMeta()`: Hook to access config anywhere
  - Returns `null` if used outside provider (graceful fallback)

- **`framework.tsx`** - React context for framework abstraction
  - `DocxesFrameworkProvider`: Injects framework implementation
  - `useFramework()`: Hook with error boundary (throws if not wrapped)

---

### 4. **Engine (`engine/` subdirectory)**
Core processing pipeline:

| File | Purpose |
|------|---------|
| **`engine.ts`** | Main orchestrator - compiles/processes docs |
| **`compiler.ts`** | Transforms markdown/MDX to components |
| **`parser.ts`** | Parses markdown content into AST |
| **`renderer.tsx`** | Renders parsed content to React components |
| **`view.tsx`** | Server component wrapper |
| **`view-client.tsx`** | Client component version |
| **`types.ts`** | Engine type definitions |
| **`bin.ts`** | CLI interface (if applicable) |
| **`index.ts`** | Exports public API |

Sub-folders:
- **`ast/`** - Abstract Syntax Tree utilities
- **`cache/`** - Caching layer for compiled docs
- **`plugins/`** - Plugin system for extending functionality

---

### 5. **Hooks (`hooks/` subdirectory)**
Reusable React hooks for document features
- **`index.ts`** - Exports hook utilities

---

### 6. **Entry Points**
- **`index.ts`** - Main export point
  - Re-exports engine API
  - Re-exports hooks

- **`nextjs.ts`** - Next.js-specific integration
  - Provides `getStaticParams()` for static generation
  - Implements `NextFramework` adapter

---

## Data Flow

```
Configuration (x-meta.config.tsx)
    ↓
XMetaProvider (context.tsx)
    ↓
DocxesFrameworkProvider (framework.tsx)
    ↓
Engine.compile() / Engine.getAllDocs()
    ↓
Parser → AST → Compiler → Renderer
    ↓
React Components (with cached output)
```

---

## Key Features

### Framework Abstraction
- Decoupled from Next.js through `DocxesFramework` interface
- Could support React Router, Remix, etc. by implementing the interface
- Currently only Next.js fully implemented

### Configuration-Driven
- All UI components customizable via `createConfig()`
- Theme, sidebar, TOC, pagination all swappable
- Syntax highlighting configurable (theme, line numbers, background)

### Versioning Support
- Built-in version management
- Can serve multiple doc versions

### Search-Ready
- Search feature can be toggled in config
- Infrastructure present for implementation

### Caching Layer
- Compiled docs cached to avoid recompilation
- `.docxes/` directory contains cache artifacts

---

## Integration Points

1. **Markdown/MDX Parsing**: Via `remark` + `rehype` ecosystem
2. **UI Components**: In `/components/` directory
3. **Content Files**: Loaded from `content/docs/`
4. **Configuration**: `x-meta.config.tsx` in project root

---

## Status

✅ **Complete & Working:**
- Framework abstraction system
- Configuration management
- Next.js integration
- Context providers
- MDX rendering pipeline

🔄 **Partially Implemented:**
- React Router framework adapter (stub only)
- Search feature (infrastructure present, feature toggleable)

---

## Design Patterns Used

1. **Provider Pattern** - XMetaProvider, DocxesFrameworkProvider
2. **Context Hook Pattern** - useXMeta(), useFramework()
3. **Strategy Pattern** - Framework abstraction (DocxesFramework interface)
4. **Factory Pattern** - createConfig() configuration factory
5. **Adapter Pattern** - Framework-specific implementations (NextFramework, etc.)
