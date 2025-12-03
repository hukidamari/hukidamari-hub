import PostList from "@/components/post-list";
import Tag from "@/components/tag";
import { getAllTags, getPostsByTag } from "@/lib/blog-utils";
import { PostTag } from "../../../../types/post";

export const generateStaticParams = (): { tag: PostTag }[] => {
  return getAllTags().map((tag) => ({ tag }));
};

export default async function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag, { oldToNew: true });
  return (
    <main>
      <h1>
        <Tag>{`#${tag}`}</Tag>の記事一覧
      </h1>
      <PostList posts={posts} />
    </main>
  );
}
