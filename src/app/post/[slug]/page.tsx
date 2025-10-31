import { getAllPostSlugs, getPost } from "../../../../lib/get-post";

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  return getAllPostSlugs();
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
