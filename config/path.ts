import "dotenv/config";

import path from "path";

export const SITE_URL = process.env.SITE_URL;

export const POSTS_DIR = "posts";
export const PUBLIC_DIR = "public";
export const POST_ASSET_DEST_DIR = path.join(PUBLIC_DIR, "post-assets");
export const DATA_DIR = "data";

if (!process.env.POST_SOURCE_DIR) {
  console.error("Not Found POST_SOURCE_DIR env");
  process.exit(1);
}
if (!process.env.IMAGE_SOURCE_DIR) {
  console.error("Not Found IMAGE_SOURCE_DIR env");
  process.exit(1);
}
if (!process.env.SOUND_SOURCE_DIR) {
  console.error("Not Found SOUND_SOURCE_DIR env");
  process.exit(1);
}
if (!process.env.MOVIE_SOURCE_DIR) {
  console.error("Not Found MOVIE_SOURCE_DIR env");
  process.exit(1);
}
if (!process.env.THUMBNAIL_SOURCE_DIR) {
  console.error("Not Found THUMBNAIL_SOURCE_DIR env");
  process.exit(1);
}
if (!process.env.SITE_URL) {
  console.error("Not Found: SITE_URL env");
  process.exit(1);
}

export const IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
export const SOUND_SOURCE_DIR = process.env.SOUND_SOURCE_DIR;
export const MOVIE_SOURCE_DIR = process.env.MOVIE_SOURCE_DIR;
export const THUMBNAIL_SOURCE_DIR = process.env.THUMBNAIL_SOURCE_DIR;
export const POST_SOURCE_DIR = process.env.POST_SOURCE_DIR;

if (
  POST_ASSET_DEST_DIR === IMAGE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === SOUND_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === MOVIE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === THUMBNAIL_SOURCE_DIR
) {
  console.error(
    `You can't set ${POST_ASSET_DEST_DIR} as IMAGE_SOURCE_DIR, SOUND_SOURCE_DIR, MOVIE_SOURCE_DIR, or THUMBNAIL_SOURCE_DIR.`
  );
  process.exit(1);
}
if (POST_SOURCE_DIR === POSTS_DIR) {
  console.error(`You can't set ${POSTS_DIR} as POSTS_SOURCE_DIR.`);
  process.exit(1);
}
