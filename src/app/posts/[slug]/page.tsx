import { getAllPostSlugs } from "@/lib/slug";
import { getPost } from "../../../lib/get-post";

export const generateStaticParams = (): { slug: string }[] => {
  return getAllPostSlugs().map((slug) => ({ slug }));
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  console.log("Generating static params for blog posts", await params);
  const { slug } = await params;
  const post = await getPost(slug);
  return <div dangerouslySetInnerHTML={{ __html: post }} />;
}
