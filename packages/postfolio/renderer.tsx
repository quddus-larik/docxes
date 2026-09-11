import React from "react";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export interface MDXRendererProps {
    content: string;
    components?: Record<string, React.ComponentType<any>>;
}

export async function MDXRenderer({ content, components }: MDXRendererProps) {
    // Compile raw MDX string to JavaScript code
    const compiled = await compile(content, {
        outputFormat: "function-body",
    });

    // Evaluate the compiled code using React's runtime
    const { default: Content } = await run(String(compiled), {
        ...runtime,
        baseUrl: import.meta.url,
    });

    return <Content components={components} />;
}