import PostList from "@/components/post-list";
import Tag from "@/components/tag";
import { getAllTags, getPostsByTag } from "@/lib/blog-utils";
import { PostTag } from "../../../../types/post";
import styles from "../tags.module.css";
import PageTitle from "@/components/page-title";
import { TagIcon } from "lucide-react";

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
        <PageTitle title={<span><Tag>{`#${tag}`}</Tag> Articles</span>} icon={<TagIcon size={26} color="var(--color-brand-primary)" />} />
      </h1>
      <PostList posts={posts} />
    </main>
  );
}
