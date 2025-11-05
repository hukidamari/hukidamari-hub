import { PostHtml } from "../../types/post";
import styles from "./post-list.module.css";
import Link from "next/link";
import Image from "next/image";
import Tag from "./tag";

const PostList = ({ posts }: { posts: PostHtml[] }) => {
  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.slug} className={styles.item}>
          <Link href={`/posts/${post.slug}`} className={styles.link}>
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
  );
};

export default PostList;
