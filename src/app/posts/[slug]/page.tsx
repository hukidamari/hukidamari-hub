import {
  getAdjacentPosts,
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-utils";
import { PostSlug } from "../../../../types/post";
import styles from "./post.module.css";
import Link from "next/link";
import Tag from "@/components/tag";
import { Metadata } from "next";
import { DEFAULT_METADATA, gnerateMetadataTitle } from "@/config/metadata";
import PostCard from "@/components/post-card";
import SimplePostLink from "@/components/simple-post-link";
import { getPostUrl, getTagUrl } from "@/lib/routes";
import TableOfContents from "@/components/table-of-content";
import PostList from "@/components/post-list";

export const generateStaticParams = (): { slug: PostSlug }[] => {
  return getAllSlugs().map((slug) => ({ slug }));
};

export async function generateMetadata({
  params,
}: {
  params: { slug: PostSlug };
}): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);

  const data: Metadata = {
    ...DEFAULT_METADATA,
    title: gnerateMetadataTitle(post.title),
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      title: post.title,
      ...(post.description && { description: post.description }),
      ...(post.thumbnail && {
        images: [
          {
            url: post.thumbnail,
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
  };

  return data;
}

export default async function BlogPost({
  params,
}: {
  params: { slug: PostSlug };
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const relatedPosts = await getRelatedPosts(post);
  const adjacentPosts = await getAdjacentPosts(slug);

  return (
    <div className={styles.container}>
      <main className={styles.postContainer}>
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
                <Link href={getTagUrl(tag)}>
                  <Tag>{`#${tag}`}</Tag>
                </Link>
              </li>
            ))}
          </ul>
          <h1>{post.title}</h1>
        </div>
        <div
          className={`markdown-body`}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className={styles.adjacentPosts}>
          <div className={styles.adjacentPostNext}>
            {adjacentPosts.next && (
              <SimplePostLink post={adjacentPosts.next} label="次の記事" />
            )}
          </div>
          <div className={styles.adjacentPostPrev}>
            {adjacentPosts.prev && (
              <SimplePostLink post={adjacentPosts.prev} label="前の記事" />
            )}
          </div>
        </div>

        <div className={styles.relatedPosts}>
          <h2>関連記事</h2>
          {relatedPosts.length > 0 ? (
            <PostList posts={relatedPosts} />
          ) : (
            <p>関連する記事はありません。</p>
          )}
        </div>
      </main>
      {
        post.headings.length > 0 && (
          <aside className={styles.tocContainer}>
            <TableOfContents headings={post.headings} />
          </aside>
        )
      }
    </div>
  );
}
