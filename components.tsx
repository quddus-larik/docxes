import React from "react";
import Link from "next/link";

type MDXComponents = Record<string, React.ComponentType<any>>;

export const mdxComponents: MDXComponents = {
    h1: (props) => <h1 className="text-3xl font-semibold mt-10 mb-4" {...props} />,
    h2: (props) => <h2 className="text-2xl font-semibold mt-8 mb-3" {...props} />,
    h3: (props) => <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />,
    p: (props) => <p className="leading-relaxed my-4" {...props} />,
    a: ({ href = "#", ...props }) => (
        <Link href={href} className="text-accent underline-offset-4 hover:underline" {...props} />
    ),
    ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 my-4" {...props} />,
    li: (props) => <li className="my-1" {...props} />,
    blockquote: (props) => (
        <blockquote className="border-l-2 border-default pl-4 italic my-4 text-foreground/70" {...props} />
    ),
    code: (props) => (
        <code className="rounded bg-default/10 px-1.5 py-0.5 text-sm" {...props} />
    ),
    pre: (props) => (
        <pre className="overflow-x-auto rounded-lg bg-default/10 p-4 my-4 text-sm" {...props} />
    ),
    img: (props) => <img className="rounded-lg my-4 max-w-full" {...props} />,
    hr: () => <hr className="border-default my-8" />,
};

export default mdxComponents;
