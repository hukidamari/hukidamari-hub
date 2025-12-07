import { getPostsPageUrl, getPostsUrl } from "@/lib/routes";
import { PostHtml } from "../../types/post";
import PostList from "./post-list";
import Link from "next/link";

import styles from "./paginated-posts.module.css";

const PaginatedPosts = ({
  posts,
  page,
  totalPages,
}: {
  posts: PostHtml[];
  page: number;
  totalPages: number;
}) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        投稿一覧 ({page} / {totalPages})
      </h1>
      <PostList posts={posts} />
      <div className={styles.pageInfo}>
        ({page} / {totalPages})
      </div>
      <div className={styles.pagination}>
        <Link href={getPostsUrl()} className={styles.paginationLink}>
          先頭へ
        </Link>
        {page - 1 > 1 && (
          <Link
            href={getPostsPageUrl(page - 1)}
            className={styles.paginationLink}
          >
            前へ
          </Link>
        )}
        {page - 1 === 1 && (
          <Link href={getPostsUrl()} className={styles.paginationLink}>
            前へ
          </Link>
        )}
        {page + 1 <= totalPages && (
          <Link
            href={getPostsPageUrl(page + 1)}
            className={styles.paginationLink}
          >
            次へ
          </Link>
        )}
        <Link
          href={getPostsPageUrl(totalPages)}
          className={styles.paginationLink}
        >
          最後へ
        </Link>
      </div>
    </div>
  );
};

export default PaginatedPosts;
