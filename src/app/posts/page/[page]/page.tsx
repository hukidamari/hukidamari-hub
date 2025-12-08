import { getAllSlugs, getPaginatedPosts } from "@/lib/blog-utils";
import PaginatedPosts from "@/components/paginated-posts";
import { POST_PER_PAGE } from "@/config/pagination";
import { notFound, redirect } from "next/navigation";
import { getPostsUrl } from "@/lib/routes";

export const generateStaticParams = (): { page: string }[] => {
  const totalPages = Math.ceil(getAllSlugs().length / POST_PER_PAGE);
  return [...Array(totalPages - 1).keys()].map((page) => ({
    page: String(page + 2),
  }));
};

export default async function BlogPosts({
  params,
}: {
  params: { page: string };
}) {
  const page = parseInt((await params).page);
  const totalPages = Math.ceil(getAllSlugs().length / POST_PER_PAGE);

  if (page === 1) {
    return redirect(getPostsUrl());
  }
  if (page < 2 || page > totalPages) {
    notFound();
  }

  const posts = await getPaginatedPosts(page, POST_PER_PAGE);

  return (
    <main>
      <PaginatedPosts
        posts={posts}
        page={page}
        totalPages={totalPages}
        totalPostsCount={getAllSlugs().length}
      />
    </main>
  );
}
