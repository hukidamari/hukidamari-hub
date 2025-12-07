import Link from "next/link";
import { PostMeta } from "../../types/post";
import { getPostUrl } from "@/lib/routes";
import styles from "./simple-post-link.module.css";

type Props = {
  post: PostMeta;
  label?: string; // e.g. "Next" or "Previous"
};

const SimplePostLink = ({ post, label }: Props) => {
  return (
    <Link href={getPostUrl(post.slug)} className={styles.link}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.title}>{post.title}</div>
      <div className={styles.date}>
        {post.createdAt.toLocaleDateString("ja-JP")}
      </div>
    </Link>
  );
};

export default SimplePostLink;
