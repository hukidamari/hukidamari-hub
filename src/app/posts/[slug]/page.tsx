import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog-utils";
import { PostSlug } from "@/types/post";
import styles from "./post.module.css";
import Link from "next/link";
import Tag from "@/component/tag";
import { Metadata } from "next";
import { DEFAULT_METADATA } from "@/config/metadata";

export const generateStaticParams = (): { slug: PostSlug }[] => {
  return getAllSlugs().map((slug) => ({ slug }));
};

export async function generateMetadata({
  params,
}: {
  params: { slug: PostSlug };
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  let data: Metadata = { ...DEFAULT_METADATA };
  if (post.description) {
    data = {
      ...data,
      openGraph: { ...data.openGraph, description: post.description },
    };
  }
  if (post.thumbnail) {
    data = {
      ...data,
      openGraph: {
        ...data.openGraph,
        images: [
          {
            url: post.thumbnail,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }
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
              <Link href={`/tags/${tag}`}>
                <Tag>{`#${tag}`}</Tag>
              </Link>
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
          {relatedPosts.map((post) => (
            <li key={post.slug}>
              <span>
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                <ul className={styles.tagContainer}>
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/tags/${tag}`}>
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
    </div>
  );
}
