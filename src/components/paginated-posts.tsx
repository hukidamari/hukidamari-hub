import { getPostsPageUrl, getPostsUrl } from "@/lib/routes";
import { PostHtml } from "../../types/post";
import Link from "next/link";
import Paginate from "./paginate";
import { BookOpen } from "lucide-react";
import PageTitle from "./page-title";

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
        title={<PageTitle title="Articles" icon={<BookOpen size={26} color="var(--color-brand-primary)" />} />}
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
