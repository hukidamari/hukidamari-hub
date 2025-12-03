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
import { getPostUrl, getTagUrl } from "@/lib/routes";
import TableOfContents from "@/components/table-of-content";

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
          {adjacentPosts.next && (
            <div>
              <h2>次の記事</h2>
              <PostCard post={adjacentPosts.next} />
            </div>
          )}
          {adjacentPosts.prev && (
            <div>
              <h2>前の記事</h2>
              <PostCard post={adjacentPosts.prev} />
            </div>
          )}
        </div>

        <div className={styles.relatedPosts}>
          <h2>関連記事</h2>
          <ul>
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <span>
                  <Link href={getPostUrl(post.slug)}>{post.title}</Link>
                  <ul className={styles.tagContainer}>
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Link href={getTagUrl(tag)}>
                          <Tag>{`#${tag}`}</Tag>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <aside className={styles.tocContainer}>
        <TableOfContents headings={post.headings} />
      </aside>
    </div>
  );
}
