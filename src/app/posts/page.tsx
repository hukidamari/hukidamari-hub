import { getAllSlugs, getPaginatedPosts } from "@/lib/blog-utils";
import PaginatedPosts from "@/components/paginated-posts";
import { POST_PER_PAGE } from "@/config/pagination";

export default async function Posts() {
  const page = 1;
  const posts = await getPaginatedPosts(page, POST_PER_PAGE, {
    oldToNew: true,
  });
  const tottalPages = Math.ceil(getAllSlugs().length / POST_PER_PAGE);

  return (
    <main>
      <PaginatedPosts
        posts={posts}
        page={page}
        totalPages={tottalPages}
        totalPostsCount={getAllSlugs().length}
      />
    </main>
  );
}
