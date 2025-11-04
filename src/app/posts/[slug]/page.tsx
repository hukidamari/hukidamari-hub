import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog-utils";
import { PostSlug } from "@/types/post";
import styles from "./post.module.css"; // ← ✅ CSS Modules に変更
import Link from "next/link";

// ✅ Promise ではなく普通の params
export const generateStaticParams = (): { slug: PostSlug }[] => {
  return getAllSlugs().map((slug) => ({ slug }));
};

export default async function BlogPost({
  params,
}: {
  params: { slug: PostSlug };
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const relatedPosts = await getRelatedPosts(post);

  return (
    <div className={styles.postContainer}>
      <div className={styles.metadataContainer}>
        <div className={styles.dateContainer}>
          <p className={`${styles.date} ${styles.createdAt}`}>
            投稿日:{post.createdAt.toLocaleDateString("ja-JP")}
          </p>
          <p className={`${styles.date} ${styles.updatedAt}`}>
            更新日:{post.updatedAt.toLocaleDateString("ja-JP")}
          </p>
        </div>

        <ul className={styles.tagContainer}>
          {post.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              <Link href={`/tags/${tag}`}>#{tag}</Link>
            </li>
          ))}
        </ul>

        <h1>{post.title}</h1>
      </div>

      <div
        className={styles.markdownBody}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <div className={styles.relatedPosts}>
        <h2>関連記事</h2>
        <ul>
          {relatedPosts.map((related) => (
            <li key={related.slug}>
              <Link href={`/posts/${related.slug}`}>{related.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
