import { POSTS_DIR } from "@/config/path";
import { getAllPostsSortedByCreatedAt } from "@/lib/blog-utils";
import Link from "next/link";
import Image from "next/image";
import styles from "./posts.module.css";
import Tag from "@/component/tag";

export default async function Posts() {
  const allPosts = await getAllPostsSortedByCreatedAt();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>投稿一覧</h1>
      <ul className={styles.list}>
        {allPosts.map((post) => (
          <li key={post.slug} className={styles.item}>
            <Link href={`${POSTS_DIR}/${post.slug}`} className={styles.link}>
              {post.thumbnail && (
                <div className={styles.thumbnailWrapper}>
                  <Image
                    src={post.thumbnail}
                    alt={`${post.title}のサムネイル`}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className={styles.thumbnail}
                  />
                </div>
              )}
              <div className={styles.itemText}>
                <div className={styles.postTitleContainer}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <div className={styles.metadataContainer}>
                    <p className={styles.date}>
                      投稿日:{post.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                    <p className={styles.date}>
                      更新日:{post.updatedAt.toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                <ul className={styles.tagContainer}>
                  {post.tags.map((tag) => (
                    <li key={tag}>{<Tag>{`#${tag}`}</Tag>}</li>
                  ))}
                </ul>
                {post.description && (
                  <p className={styles.description}>{post.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
