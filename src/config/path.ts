import { config } from "dotenv";

config();

export const POSTS_DIR = process.env.POSTS_DEST_DIR;

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  POSTS: "/posts",
  TAGS: "/tags",
};
