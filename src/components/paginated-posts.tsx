import { getPostsPageUrl, getPostsUrl } from "@/lib/routes";
import { PostHtml } from "../../types/post";
import Link from "next/link";
import Paginate from "./paginate";

const PaginatedPosts = ({
  posts,
  page,
  totalPages,
  totalPostsCount,
}: {
  posts: PostHtml[];
  page: number;
  totalPages: number;
  totalPostsCount: number;
}) => {
  const adjacentPageLinks = [...Array(totalPages)].map((_, i) => {
    const pageNum = i + 1;
    return (
      <Link
        key={pageNum}
        href={pageNum === 1 ? getPostsUrl() : getPostsPageUrl(pageNum)}
      >
        {pageNum}
      </Link>
    );
  });

  return (
    <div>
      <Paginate
        title="記事一覧"
        posts={posts}
        page={page}
        totalPages={totalPages}
        totalPostsCount={totalPostsCount}
        adjacentPageLinks={adjacentPageLinks}
      />
    </div>
  );
};

export default PaginatedPosts;
