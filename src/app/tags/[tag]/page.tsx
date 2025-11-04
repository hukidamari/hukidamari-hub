import PostList from "@/component/post-list";
import Tag from "@/component/tag";
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
      <h1>
        <Tag>{`#${tag}`}</Tag>の記事一覧
      </h1>
      <PostList posts={posts} />
    </div>
  );
}
