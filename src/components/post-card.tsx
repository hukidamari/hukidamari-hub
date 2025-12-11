import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/tag";
import { PostMeta } from "../../types/post";
import { getPostAssetUrlByFilename, getPostUrl } from "@/lib/routes";
import styles from "./post-card.module.css";
import { ogApiUrl } from "@/config/api-route";

const PostCard = ({ post }: { post: PostMeta }) => {
  return (
    <Link href={getPostUrl(post.slug)} className={styles.link}>
      {/* 1. Title */}
      <h3 className={styles.postTitle}>{post.title}</h3>

      {/* 2. Thumbnail */}
      <div className={styles.thumbnailWrapper}>
        {post.thumbnail ? (
          <Image
            src={getPostAssetUrlByFilename(post.thumbnail)}
            alt={`${post.title}のサムネイル`}
            fill
            className={styles.thumbnail}
          />
        ) : (
          <Image
            src={ogApiUrl(post.title)}
            alt={`${post.title}のサムネイル`}
            fill
            className={styles.thumbnail}
          />
        )}
      </div>

      <div className={styles.itemText}>
        {/* 3. Description */}
        {post.description && (
          <p className={styles.description}>{post.description}</p>
        )}

        {/* 4. Tag */}
        <ul className={styles.tagContainer}>
          {post.tags.map((tag) => (
            <li key={tag}>
              {
                <object>
                  <Link href={`/tags/${tag}`}>
                    <Tag>{`#${tag}`}</Tag>
                  </Link>
                </object>
              }
            </li>
          ))}
        </ul>

        {/* 5. Date */}
        <div className={styles.metadataContainer}>
          <p className={styles.date}>
            投稿日:{post.createdAt.toLocaleDateString("ja-JP")}
          </p>
          <p className={styles.date}>
            更新日:{post.updatedAt.toLocaleDateString("ja-JP")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
