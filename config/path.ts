import "dotenv/config";

import path from "path";

export const POSTS_DIR = "posts";
export const PUBLIC_DIR = "public";
export const POST_ASSET_DEST_DIR = path.join(PUBLIC_DIR, "post-assets");
export const DATA_DIR = "data";

if (!process.env.SITE_URL) {
  console.error("Not Found: SITE_URL env");
  process.exit(1);
}

export const SITE_URL = process.env.SITE_URL;
