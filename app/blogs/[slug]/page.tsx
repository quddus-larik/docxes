import {notFound} from "next/navigation";
import {LocalPosts} from "postfolio";
import {MDXRenderer} from "postfolio/renderer";
import mdxComponents from "@/components";
import {Typography, Chip} from "@heroui/react";

export async function generateStaticParams() {
    const posts = await LocalPosts();

    return posts.map((post) => ({slug: post.slug}));
}

export default async function Page({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const posts = await LocalPosts();
    const post = posts.find((itm) => itm.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main className={"px-60 py-16"}>
            <Typography.Heading level={2}>{post.meta.title}</Typography.Heading>
            <Typography.Paragraph>{post.meta.description}</Typography.Paragraph>
            <div className={"flex items-center gap-1"}>
                {
                    post.meta.tags.map((tag:string) => (
                        <Chip color={"accent"} variant="soft"  size={"sm"}>{tag}</Chip>
                    ))
                }
            </div>
            <MDXRenderer content={post.content} components={mdxComponents}/>
        </main>
    );
}
