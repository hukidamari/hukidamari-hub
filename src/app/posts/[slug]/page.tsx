import { getAllPostSlugs } from "@/lib/slug-map";
import { getPost } from "../../../lib/post-loader";
import { PostSlug } from "@/types/post";

export const generateStaticParams = (): { slug: PostSlug }[] => {
  return getAllPostSlugs().map((slug) => ({ slug }));
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: PostSlug }>;
}) {
  console.log("Generating static params for blog posts", await params);
  const { slug } = await params;
  const post = await getPost(slug);
  return <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />;
}
