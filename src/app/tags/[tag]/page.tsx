import { getAllTags, getPostsByTag } from "@/lib/blog-utils";
import { PostTag } from "@/types/post";

export const generateStaticParams = (): { tag: PostTag }[] => {
  return getAllTags().map((tag) => ({ tag }));
};

export default async function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);
  return (
    <div>
      <h1>{tag} の記事一覧</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
