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
import {
  extractFrontMatter,
  parseFrontMatter,
} from "../lib/parse-markdown-utils";
import { DATA_DIR, POSTS_DIR } from "../config/path";
import { POST_SOURCE_DIR } from "../config/external-path";

type MetadataBundle = {
  filenameToSlug: Record<string, PostSlug>;
  slugToFilename: Record<PostSlug, string>;
  slugToMetadata: Record<PostSlug, PostMeta>;
  tagToSlugs: Record<PostTag, PostSlug[]>;
};

const isValidSlug = (slug: PostSlug) => /^[a-z0-9-]+$/.test(slug);
const initPostsDestDir = () => {
  fs.rmSync(POSTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });
};
const overwriteJsonFile = (filePath: string, data: Record<string, any>) => {
  fs.writeFileSync(fs.openSync(filePath, "w"), JSON.stringify(data, null, 2));
};

const initializeDirectories = () => {
  initPostsDestDir();
  initSourceDestDir();
};

/**
 * 投稿メタデータの検証を行う
 * @returns 検証が通れば true、失敗すれば false
 */
const validatePostMeta = (
  meta: PostMeta,
  filename: string,
  existingSlugMeta: Record<PostSlug, PostMeta>
): boolean => {
  if (!meta.slug) {
    console.warn(`Warning: Post "${filename}" is missing a slug. Skipping.`);
    return false;
  }
  if (!isValidSlug(meta.slug)) {
    console.warn(`Warning: Post "${filename}" has unvalid slug. Skipping.`);
    return false;
  }
  if (!meta.filename) {
    console.warn(
      `Warning: Post "${filename}" is missing a filename. Skipping.`
    );
    return false;
  }
  if (!meta.createdAt) {
    console.warn(
      `Warning: Post "${filename}" is missing a createdAt. Skipping.`
    );
    return false;
  }
  if (!meta.updatedAt) {
    console.warn(
      `Warning: Post "${filename}" is missing a updatedAt. Skipping.`
    );
    return false;
  }
  if (Object.keys(existingSlugMeta).includes(meta.slug)) {
    console.warn(
      `Warning: Post "${filename}" has duplicate slug with ${meta.slug} of "${
        existingSlugMeta[meta.slug].title
      }". Skipping.`
    );
    return false;
  }
  return true;
};

/**
 * 記事コンテンツとメタデータから関連メディアを収集する
 */
const collectMediaFiles = (content: string, meta: PostMeta) => {
  collectImageFiles(content);
  collectSoundFiles(content);
  collectMovieFiles(content);
  if (meta.thumbnail) {
    collectThumbnailFile(meta.thumbnail);
  }
};

/**
 * 1つのポストファイルを処理する
 * @returns 処理が成功した場合は PostMeta を、スキップした場合は null を返す
 */
const processSinglePost = (
  filename: string,
  existingSlugMeta: Record<PostSlug, PostMeta>
): PostMeta | null => {
  const srcPath = path.join(POST_SOURCE_DIR, filename);
  const destPath = path.join(POSTS_DIR, filename);

  // 1. FrontMatterを抽出し、公開可能かチェック
  const { data, content } = extractFrontMatter(srcPath);
  if (!canPublish(data)) {
    console.log(`Skipping: ${filename}; canPublish() returned false.`);
    return null;
  }

  // 2. FrontMatterをパース
  const meta = parseFrontMatter(filename, data as FrontMatter);

  // 3. メタデータを検証
  if (!validatePostMeta(meta, filename, existingSlugMeta)) {
    return null; // 検証失敗（ログは validatePostMeta 内で出力済み）
  }

  // 4. メディアファイルを収集
  collectMediaFiles(content, meta);

  // 5. 記事ファイルをコピー
  fs.cpSync(srcPath, destPath, { recursive: true });

  return meta;
};

/**
 * すべてのポストファイルを処理し、メタデータを集約する
 * @returns 集約されたメタデータ
 */
const processAllPosts = (): MetadataBundle => {
  const filenameToSlug: Record<string, PostSlug> = {};
  const slugToFilename: Record<PostSlug, string> = {};
  const slugToMetadata: Record<PostSlug, PostMeta> = {};
  const tagToSlugs: Record<PostTag, PostSlug[]> = {};

  const filenames = fs.readdirSync(POST_SOURCE_DIR);

  for (const filename of filenames) {
    const meta = processSinglePost(filename, slugToMetadata);

    // スキップされたファイル（metaがnull）はメタデータに追加しない
    if (!meta) {
      continue;
    }

    // メタデータを集約
    slugToFilename[meta.slug] = meta.filename;
    filenameToSlug[meta.filename] = meta.slug;
    slugToMetadata[meta.slug] = meta;
    meta.tags.forEach((tag: PostTag) => {
      if (!tagToSlugs[tag]) {
        tagToSlugs[tag] = [];
      }
      tagToSlugs[tag].push(meta.slug);
    });
  }
  console.log("-".repeat(40));
  console.log(`${Object.keys(slugToMetadata).length} posts are collected.`);
  return { filenameToSlug, slugToFilename, slugToMetadata, tagToSlugs };
};

/**
 * 集約されたメタデータをJSONファイルに書き出す
 */
const writeMetadataFiles = ({
  filenameToSlug,
  slugToFilename,
  tagToSlugs,
}: MetadataBundle) => {
  overwriteJsonFile(
    path.join(DATA_DIR, "slug-to-filename.json"),
    slugToFilename
  );
  overwriteJsonFile(
    path.join(DATA_DIR, "filename-to-slug.json"),
    filenameToSlug
  );
  overwriteJsonFile(path.join(DATA_DIR, "tag-to-slugs.json"), tagToSlugs);
  // slug-to-metadata.json は現状なし
};

// --- メイン処理 ---

const main = () => {
  // 1. ディレクトリ初期化
  initializeDirectories();

  // 2. 全ポストの処理とメタデータ集約
  const metadataBundle = processAllPosts();

  // 3. メタデータファイルの書き出し
  writeMetadataFiles(metadataBundle);
};

main();
