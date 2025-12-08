import { getAllPostsSortedByCreatedAt } from "@/lib/blog-utils";
import fs from "fs";
import path from "path";
import RSS from "rss";
import { SITE_URL } from "../../config/path";
import { getPostUrl } from "@/lib/routes";

export async function generateRssFeed() {
  const posts = await getAllPostsSortedByCreatedAt();

  const feed = new RSS({
    title: "hukidamariHUB",
    description: "Latest posts from hukidamariHUB",
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.xml`,
    language: "ja",
  });

  posts.forEach((post) => {
    const postUrl = `${SITE_URL}/${getPostUrl(post.slug)}`;
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
