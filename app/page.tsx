import {Button, Typography, Card} from "@heroui/react";
import {Npm, Github} from "@thesvg/react";
import {ArrowUpRight} from "lucide-react";
import Link from "next/link";

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
                    <Link href={"/blogs/getting-started"}>
                        <Button>Getting Started</Button>
                    </Link>
                    <a href={"https://npmjs.com/postfolio"} target={"_blank"}>
                        <Button><Npm variant="mono"/>View in npmjs</Button>
                    </a>
                    <a href={"https://github.com/quddus-larik/postfolio"} target={"_blank"}>
                        <Button isIconOnly><Github variant={"mono"}/></Button>
                    </a>
                </div>
                <Typography.Paragraph>
                    Build your blogs with Statically in NextJS
                </Typography.Paragraph>
                <Typography.Heading level={1}>Showcases</Typography.Heading>
                <div className={"flex gap-2"}>
                    <a href={"https://quddus.is-a.dev"} target={"_blank"}>
                        <Card className="w-[320px] relative hover:shadow-sm" variant="default">
                            <ArrowUpRight className={"absolute top-2 right-2 size-5"}/>
                            <Card.Header>
                                <Card.Title>Quddu's blogs</Card.Title>
                                <Card.Description>Minimal prominence with transparent background</Card.Description>
                            </Card.Header>
                        </Card>
                    </a>
                </div>
            </main>
        </div>
    );
}
