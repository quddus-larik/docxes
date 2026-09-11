import {Button, Typography} from "@heroui/react";
import { Npm, Github } from "@thesvg/react";

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            <main className={"flex flex-col gap-2 w-3xl py-32 px-16"}>
                <Typography.Heading level={1}>Postfolio</Typography.Heading>
                <Typography.Paragraph>
                    A lightweight, plug-and-play adapter for MDX-based blogs and portfolios. It supports local MDX
                    files, Dev.to, and GitHub Markdown, allowing you to integrate content seamlessly into your own UI
                    design system.
                </Typography.Paragraph>
                <Typography.Paragraph>
                    It allows you to import your Dev.to blog posts into your portfolio while maintaining your own design
                    system.
                </Typography.Paragraph>
                <div className={"flex gap-2 items-center"}>
                    <Button>Getting Started</Button>
                    <Button><Npm />View in npmjs</Button>
                    <Button isIconOnly><Github variant={"mono"} /></Button>
                </div>
                <Typography.Paragraph>
                    Build your blogs with Statically in NextJS
                </Typography.Paragraph>

            </main>
        </div>
    );
}
