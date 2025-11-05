import { SITE_URL } from "@/config/route";
import { getAllPostsSortedByCreatedAt } from "@/lib/blog-utils";
import fs from "fs";
import path from "path";
import RSS from "rss";

export async function generateRssFeed() {
  const posts = await getAllPostsSortedByCreatedAt();

  const feed = new RSS({
    title: "Vault Blog Core",
    description: "Latest posts from Vault Blog Core",
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.xml`,
    language: "ja",
  });

  posts.forEach((post) => {
    const postUrl = `${SITE_URL}/posts/${post.slug}`;
    feed.item({
      title: post.title,
      description: post.description,
      url: postUrl,
      date: post.createdAt,
    });
  });

  const xml = feed.xml({ indent: true });
  const outputPath = path.join(process.cwd(), "public", "feed.xml");
  fs.writeFileSync(outputPath, xml);

  console.log("✅ RSS feed generated at:", outputPath);
}
