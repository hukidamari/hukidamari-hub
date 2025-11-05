import "dotenv/config";

import { FrontMatter, PostMeta, PostSlug, PostTag } from "../types/post";
import * as fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  initSourceDestDir,
  collectImageFiles,
  collectSoundFiles,
  collectMovieFiles,
  collectThumbnailFile,
} from "./collect-source-files";
import { canPublish } from "./config";
import { parseFrontMatter } from "../lib/parse-post";

const SOURCE_DIR = process.env.POSTS_SOURCE_DIR;
if (!SOURCE_DIR) {
  console.error("Not Found SOURCE_DIR env");
  process.exit(1);
}
const DEST_DIR = "posts"; // NOTE: must be same with config.DEST_DIR
if (SOURCE_DIR === DEST_DIR) {
  console.error(`You can't set ${DEST_DIR} as POSTS_SOURCE_DIR.`);
  process.exit(1);
}
const titleToSlug: Record<string, PostSlug> = {};
const slugToTitle: Record<PostSlug, string> = {};
const slugToMetadata: Record<PostSlug, PostMeta> = {};
const tagToSlugs: Record<PostTag, PostSlug[]> = {};

const getMdDatas = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};
const isValidSlug = (slug: PostSlug) => /^[a-z0-9-]+$/.test(slug);
const initPostsDestDir = () => {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEST_DIR, { recursive: true });
};
const overwriteJsonFile = (filePath: string, data: Record<string, any>) => {
  fs.writeFileSync(fs.openSync(filePath, "w"), JSON.stringify(data, null, 2));
};

const main = () => {
  initPostsDestDir();
  initSourceDestDir();

  // SOURCE_DIR 内の全アイテムを DEST_DIR にコピー
  fs.readdirSync(SOURCE_DIR).forEach((item: string) => {
    const srcPath = path.join(SOURCE_DIR, item);
    const destPath = path.join(DEST_DIR, item);

    // validate front matter
    const { data, content } = getMdDatas(srcPath);
    if (!canPublish(data)) {
      console.log(
        `Skipping unpublished post: ${item} because your canPublish function returned false.`
      );
      return;
    }

    const meta = parseFrontMatter(item, data as FrontMatter);

    if (!meta.slug) {
      console.warn(`Warning: Post "${item}" is missing a slug. Skipping.`);
      return;
    }
    if (!isValidSlug(meta.slug)) {
      console.warn(`Warning: Post "${item}" has unvalid slug. Skipping.`);
      return;
    }
    if (!meta.createdAt) {
      console.warn(`Warning: Post "${item}" is missing a createdAt. Skipping.`);
      return;
    }
    if (!meta.updatedAt) {
      console.warn(`Warning: Post "${item}" is missing a updatedAt. Skipping.`);
      return;
    }
    if (Object.keys(slugToMetadata).includes(meta.slug)) {
      console.warn(
        `Warning: Post "${item}" has duplicate slug with ${meta.slug} of "${
          slugToMetadata[meta.slug].title
        }". Skipping.`
      );
      return;
    }

    slugToTitle[meta.slug] = meta.title;
    titleToSlug[meta.title] = data.slug;
    slugToMetadata[meta.slug] = meta;
    meta.tags.forEach((tag: PostTag) => {
      if (!tagToSlugs[tag]) {
        tagToSlugs[tag] = [];
      }
      tagToSlugs[tag].push(meta.slug);
    });

    collectImageFiles(content);
    collectSoundFiles(content);
    collectMovieFiles(content);
    collectThumbnailFile(meta.thumbnail);

    fs.cpSync(srcPath, destPath, { recursive: true });
  });

  const DATA_DIR = "src/data";
  overwriteJsonFile(path.join(DATA_DIR, "slug-to-title.json"), slugToTitle);
  overwriteJsonFile(path.join(DATA_DIR, "title-to-slug.json"), titleToSlug);
  overwriteJsonFile(path.join(DATA_DIR, "tag-to-slugs.json"), tagToSlugs);
};

main();
