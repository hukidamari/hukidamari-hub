import PostList from "@/components/post-list";
import Tag from "@/components/tag";
import { getAllTags, getPostsByTag } from "@/lib/blog-utils";
import { PostTag } from "../../../../types/post";
import styles from "../tags.module.css";

export const generateStaticParams = (): { tag: PostTag }[] => {
  return getAllTags().map((tag) => ({ tag }));
};

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tagEncoded = (await params).tag;
  const tag = decodeURIComponent(tagEncoded);
  const posts = await getPostsByTag(tag);
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        <Tag>{`#${tag}`}</Tag>の記事一覧
      </h1>
      <PostList posts={posts} />
    </main>
  );
}
