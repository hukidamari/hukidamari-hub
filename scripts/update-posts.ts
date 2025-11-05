import "dotenv/config";

import { FrontMatter, PostMeta, PostSlug, PostTag } from "../types/post";
import * as fs from "fs";
import path from "path";
import {
  initSourceDestDir,
  collectImageFiles,
  collectSoundFiles,
  collectMovieFiles,
  collectThumbnailFile,
} from "../lib/collect-source-files";
import { canPublish } from "../config/can-publish";
import { extractFrontMatter, parseFrontMatter } from "../lib/markdown-utils";
import { DATA_DIR, POSTS_DIR } from "../config/path";
import { POST_SOURCE_DIR } from "../config/external-path";

const filenameToSlug: Record<string, PostSlug> = {};
const slugToFilename: Record<PostSlug, string> = {};
const slugToMetadata: Record<PostSlug, PostMeta> = {};
const tagToSlugs: Record<PostTag, PostSlug[]> = {};

const isValidSlug = (slug: PostSlug) => /^[a-z0-9-]+$/.test(slug);
const initPostsDestDir = () => {
  fs.rmSync(POSTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });
};
const overwriteJsonFile = (filePath: string, data: Record<string, any>) => {
  fs.writeFileSync(fs.openSync(filePath, "w"), JSON.stringify(data, null, 2));
};

const main = () => {
  initPostsDestDir();
  initSourceDestDir();

  // SOURCE_DIR 内の全アイテムを DEST_DIR にコピー
  fs.readdirSync(POST_SOURCE_DIR).forEach((filename: string) => {
    const srcPath = path.join(POST_SOURCE_DIR, filename);
    const destPath = path.join(POSTS_DIR, filename);

    // validate front matter
    const { data, content } = extractFrontMatter(srcPath);
    if (!canPublish(data)) {
      console.log(
        `Skipping unpublished post: ${filename} because your canPublish function returned false.`
      );
      return;
    }

    const meta = parseFrontMatter(filename, data as FrontMatter);

    if (!meta.slug) {
      console.warn(`Warning: Post "${filename}" is missing a slug. Skipping.`);
      return;
    }
    if (!isValidSlug(meta.slug)) {
      console.warn(`Warning: Post "${filename}" has unvalid slug. Skipping.`);
      return;
    }
    if (!meta.filename) {
      console.warn(
        `Warning: Post "${filename}" is missing a filename. Skipping.`
      );
      return;
    }
    if (!meta.createdAt) {
      console.warn(
        `Warning: Post "${filename}" is missing a createdAt. Skipping.`
      );
      return;
    }
    if (!meta.updatedAt) {
      console.warn(
        `Warning: Post "${filename}" is missing a updatedAt. Skipping.`
      );
      return;
    }
    if (Object.keys(slugToMetadata).includes(meta.slug)) {
      console.warn(
        `Warning: Post "${filename}" has duplicate slug with ${meta.slug} of "${
          slugToMetadata[meta.slug].title
        }". Skipping.`
      );
      return;
    }

    slugToFilename[meta.slug] = meta.filename;
    filenameToSlug[meta.filename] = meta.slug;
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
    if (meta.thumbnail) {
      collectThumbnailFile(meta.thumbnail);
    }

    fs.cpSync(srcPath, destPath, { recursive: true });
  });

  overwriteJsonFile(
    path.join(DATA_DIR, "slug-to-filename.json"),
    slugToFilename
  );
  overwriteJsonFile(
    path.join(DATA_DIR, "filename-to-slug.json"),
    filenameToSlug
  );
  overwriteJsonFile(path.join(DATA_DIR, "tag-to-slugs.json"), tagToSlugs);
};

main();
