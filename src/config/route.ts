import "dotenv/config";

if (!process.env.SITE_URL) {
  console.error("Not Found: SITE_URL env");
  process.exit(1);
}

export const SITE_URL = process.env.SITE_URL;
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  POSTS: "/posts",
  TAGS: "/tags",
};
