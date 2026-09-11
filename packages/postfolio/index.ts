import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createJiti } from "jiti";
import matter from "gray-matter";

export async function PostfolioConfig() {
    const projectRoot = process.cwd();
    const configPath = path.resolve(projectRoot, "postfolio.config.ts");

    if (!existsSync(configPath)) {
        throw new Error(`Config file not found at ${configPath}`);
    }

    const jiti = createJiti(import.meta.url, { cache: false });
    const configModule = (await jiti.import(configPath)) as any;

    const rawConfig = configModule.default || configModule.postfolioConfig || configModule;
    const configData = rawConfig.default || rawConfig;

    if (typeof configData !== "object" || configData === null) {
        throw new Error("postfolio.config.ts must export an object as default or 'postfolioConfig'");
    }

    return configData;
}

function toSlug(filename: string): string {
    return filename
        .replace(/\.mdx$/, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function LocalPosts() {
    const configData = await PostfolioConfig();

    if (!configData.localPosts?.dir) {
        throw new Error("Missing 'localPosts.dir' in postfolio.config.ts");
    }

    const projectRoot = process.cwd();
    const postsDir = path.resolve(projectRoot, configData.localPosts.dir);
    if (!existsSync(postsDir)) {
        throw new Error(`postsDir not found at ${postsDir}`);
    }

    const entries = await fs.readdir(postsDir, { withFileTypes: true });
    const mdxFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));

    const posts = await Promise.all(
        mdxFiles.map(async (entry) => {
            const filePath = path.join(postsDir, entry.name);
            const fileContent = await fs.readFile(filePath, "utf8");
            const { data, content } = matter(fileContent);

            return {
                name: entry.name,
                slug: toSlug(entry.name),
                path: filePath,
                meta: data,       // Extracted frontmatter object (title, date, tags, etc.)
                content: content, // Raw MDX content without frontmatter
            };
        })
    );

    return posts;
}

export async function ShowData() {
    const data = await PostfolioConfig();
    return data.name;
}