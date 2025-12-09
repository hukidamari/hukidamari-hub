import { PostMeta } from "../../types/post";
import PostList from "./post-list";
import styles from "./paginate.module.css";
import { JSX, ReactNode } from "react";
import { POST_PER_PAGE } from "@/config/pagination";

const Paginate = ({
  title,
  posts,
  page,
  totalPages,
  totalPostsCount,
  adjacentPageLinks,
}: {
  title: string|ReactNode;
  posts: PostMeta[];
  page: number;
  totalPages: number;
  totalPostsCount: number;
  adjacentPageLinks: JSX.Element[];
}) => {
  const firstPostNum = POST_PER_PAGE * (page - 1) + 1;
  const lastPostNum = firstPostNum + posts.length - 1;

  return (
    <>
      <h1 className={styles.title}>{title} </h1>
      <div className={styles.pageDescription}>
        {totalPostsCount}件中 {firstPostNum}～{lastPostNum}
        件目
      </div>
      <PostList posts={posts} />
      <div className={styles.pageNum}>
        ({page} / {totalPages})
      </div>
      <ul className={styles.adjacentPagesContainer}>
        {adjacentPageLinks.map((l, i) => (
          <li
            key={`adjacentPageList-${i}`}
            className={i + 1 === page ? styles.currentPageLink : undefined}
          >
            {l}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Paginate;
