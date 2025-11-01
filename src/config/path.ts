import { config } from "dotenv";

config();

export const POSTS_DIR = process.env.POSTS_DEST_DIR;

if (!POSTS_DIR) {
  console.error("Not Found POSTS_DEST_DIR env");
  process.exit(1);
}

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  POSTS: "/posts",
  TAGS: "/tags",
};
