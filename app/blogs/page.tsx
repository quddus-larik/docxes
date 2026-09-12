import Link from "next/link";
import { LocalPosts } from "postfolio";

export default async function Page() {
    const posts = await LocalPosts();

    return (
        <>
            <ul>
                {posts.map((post: { slug: string, meta: any }) => (
                    <li key={post.slug}>
                        <Link href={`/blogs/${post.slug}`}>
                            {post.meta.title ?? post.slug}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
