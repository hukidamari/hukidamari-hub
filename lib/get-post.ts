import { PostMd } from "../types/post";
import { markdownToHtml } from "./markdown-to-html";
import * as fs from "fs";

export const getPost = async (slug: string): Promise<string> => {
  const posts = await getPostMdArray();
  const post = posts.find((post) => post.slug === slug);
  if (!post) {
    return "Not Found";
  }
  return markdownToHtml(post.content);
};

export const getAllPostSlugs = async (): Promise<{ slug: string }[]> => {
  return (await getPostMdArray()).map((post) => ({ slug: post.slug }));
};

const getPostMdArray = async (): Promise<PostMd[]> => {
  const dirPath = "posts";
  const fileNames = fs.readdirSync(dirPath);
  console.log("Reading posts from directory:", dirPath);
  return fileNames.map((fileName) => {
    const slug = fileName.replace(".md", "");
    const content = fs.readFileSync(`posts/${fileName}`, "utf-8");
    return { slug, content };
  });
};
