# DocXes Performance Optimization Strategy

## 1. Static Content Pre-Processing
All MDX files are processed by the **DocXes Engine** during build time.
The engine:
- Generates a optimized AST.
- Extracts metadata (Frontmatter, TOC) to JSON.
- Stores these artifacts in the `.docxes` directory.

## 2. Incremental Cache
The `CacheManager` uses a file-based key-value store to avoid redundant processing.
In development, this speeds up hot-reloads.
In production, it allows for faster Incremental Static Regeneration (ISR).

## 3. Modular MDX Compilation
By separating the **Parser** from the **Compiler**, we can:
- Quickly generate navigation and TOC without compiling the full MDX to JS.
- Compile MDX only when a specific page is requested or built.

## 4. Search Indexing
The engine provides a `SearchIndexer` that hooks into the processing pipeline.
It generates a lightweight search index (e.g., for FlexSearch) alongside the content artifacts, reducing client-side processing.

## 5. Framework-Agnostic Core
The core engine (`core/docxes`) is decoupled from React/Next.js.
This allows it to run in:
- Build scripts (Node.js).
- CI/CD pipelines.
- Serverless functions without heavy UI dependencies.

## 6. Cold Start Optimization
By using pre-compiled artifacts from `.docxes`, serverless functions can skip the heavy MDX compilation step, significantly reducing TTFB (Time To First Byte).
