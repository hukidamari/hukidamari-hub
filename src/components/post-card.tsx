import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/tag";
import { PostHtml } from "../../types/post";
import { getPostAssetUrlByFilename, getPostUrl } from "@/lib/routes";
import styles from "./post-card.module.css";
import { ogApiUrl } from "@/config/api-route";

const PostCard = ({ post }: { post: PostHtml }) => {
  return (
    <Link href={getPostUrl(post.slug)} className={styles.link}>
      <div className={styles.thumbnailWrapper}>
        {post.thumbnail ? (
          <Image
            src={getPostAssetUrlByFilename(post.thumbnail)}
            alt={`${post.title}のサムネイル`}
            fill
          />
        ) : (
          <Image
            src={ogApiUrl(post.title)}
            alt={`${post.title}のサムネイル`}
            fill
            unoptimized
          />
        )}
      </div>
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
  );
};

export default PostCard;
