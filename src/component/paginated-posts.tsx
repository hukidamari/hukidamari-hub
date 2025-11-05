import { PostHtml } from "../../types/post";
import PostList from "./post-list";
import Link from "next/link";

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
    <div
      style={{
        padding: "2rem 1rem",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "1.75rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        投稿一覧 ({page} / {totalPages})
      </h1>
      <PostList posts={posts} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        ({page} / {totalPages})
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
        }}
      >
        <Link href="/posts">最初のページ</Link>
        {page - 1 > 1 && <Link href={`/posts/page/${page - 1}`}>前へ</Link>}
        {page - 1 === 1 && <Link href={`/posts`}>前へ</Link>}
        {page + 1 <= totalPages && (
          <Link href={`/posts/page/${page + 1}`}>次へ</Link>
        )}
        <Link href={`/posts/page/${totalPages}`}>最後のページ</Link>
      </div>
    </div>
  );
};

export default PaginatedPosts;
