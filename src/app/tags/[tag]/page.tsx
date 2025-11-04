import { getAllTags, getPostsByTag } from "@/lib/blog-utils";
import { PostTag } from "@/types/post";
import Link from "next/link";

export const generateStaticParams = (): { tag: PostTag }[] => {
  return getAllTags().map((tag) => ({ tag }));
};

export default async function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);
  return (
    <div>
      <h1>{tag} の記事一覧</h1>
      <ul className="all-tags">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
