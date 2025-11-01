import "dotenv/config";

const _POSTS_DIR = process.env.POSTS_DEST_DIR;
const _IMAGES_DIR = process.env.IMAGE_DEST_DIR;

if (!_POSTS_DIR) {
  console.error("Not Found POSTS_DEST_DIR env");
  process.exit(1);
}
if (!_IMAGES_DIR) {
  console.error("Not Found IMAGE_DEST_DIR env");
  process.exit(1);
}
export const POSTS_DIR = _POSTS_DIR;
export const IMAGES_DIR = _IMAGES_DIR;

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  POSTS: "/posts",
  TAGS: "/tags",
};
