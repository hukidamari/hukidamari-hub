import { getAllPostsSortedByCreatedAt } from "@/lib/blog-utils";
import styles from "./posts.module.css";
import PostList from "@/component/post-list";

export default async function Posts() {
  const allPosts = await getAllPostsSortedByCreatedAt();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>投稿一覧</h1>
      <PostList posts={allPosts} />
    </div>
  );
}
