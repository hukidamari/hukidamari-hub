const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

require("dotenv").config();

const SOURCE_DIR = process.env.POSTS_SOURCE_DIR;
const IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
const SOUND_SOURCE_DIR = process.env.SOUND_SOURCE_DIR;
const MOVIE_SOURCE_DIR = process.env.MOVIE_SOURCE_DIR;
if (!SOURCE_DIR) {
  console.error("Not Found SOURCE_DIR env");
  process.exit(1);
}
if (!IMAGE_SOURCE_DIR) {
  console.error("Not Found IMAGE_SOURCE_DIR env");
  process.exit(1);
}
if (!SOUND_SOURCE_DIR) {
  console.error("Not Found SOUND_SOURCE_DIR env");
  process.exit(1);
}
if (!MOVIE_SOURCE_DIR) {
  console.error("Not Found MOVIE_SOURCE_DIR env");
  process.exit(1);
}
const DEST_DIR = "posts"; // NOTE: must be same with config.DEST_DIR
const POST_ASSET_DEST_DIR = "public/post-assets"; // NOTE: must be same with config.POST_SSET_DEST_DIR
const titleToSlug = {};
const slugToTitle = {};
const slugToMetadata = {};
const tagToSlugs = {};

const getMdDatas = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};
const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);
const sourceWikiLinksRegex = (exts) => {
  // EX: exts = ["png", "jpg", "gif"]
  return new RegExp(`!\\[\\[(.+?)\\.(${exts.join("|")})\\]\\]`, "gi");
};
const collectImageFiles = (content) => {
  collectSourceFiles(content, ["png", "jpg", "jpeg", "gif"], IMAGE_SOURCE_DIR);
};
const collectSoundFiles = (content) => {
  collectSourceFiles(content, ["mp3", "wav"], SOUND_SOURCE_DIR);
};
const collectMovieFiles = (content) => {
  collectSourceFiles(content, ["mp4", "mov", "avi"], MOVIE_SOURCE_DIR);
};
const collectSourceFiles = (content, exts, sourceDir) => {
  const matches = content.matchAll(sourceWikiLinksRegex(exts));

  for (const match of matches) {
    const p1 = match[1];
    const ext = match[2];
    const parts = p1.split("|");
    const fileName = `${parts[0]}.${ext}`;
    const srcPath = path.join(sourceDir, fileName);
    const destPath = path.join(POST_ASSET_DEST_DIR, encodeForURI(fileName));

    if (!fs.existsSync(srcPath)) {
      console.warn(`Not Found: source directory ${srcPath} is not found.`);
      continue;
    }
    if (fs.existsSync(destPath)) {
      continue;
    }

    const { size } = fs.statSync(srcPath);
    const sizeMB = size / (1024 * 1024);
    if (sizeMB > 1) {
      console.warn(`Large file (${sizeMB.toFixed(2)} MB): ${srcPath}`);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath);
  }
};
const initImageDestDir = () => {
  fs.rmSync(POST_ASSET_DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(POST_ASSET_DEST_DIR, { recursive: true });
};
const initPostsDestDir = () => {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEST_DIR, { recursive: true });
};
const encodeForURI = (text) => {
  return encodeURIComponent(text.replace(/\s/g, "-"));
};
const parseFrontMatter = (filePath, fm) => {
  const rev = {
    slug: fm.slug,
    title: filePath.replace(".md", ""),
    published: fm.published,
    tags: fm.tags ?? [],
    description: fm.description,
    thumbnail: fm.thumbnail,
    createdAt: fm.createdAt,
    updatedAt: fm.updatedAt,
  };
  return rev;
};
const overwriteJsonFile = (filePath, data) => {
  fs.writeFileSync(fs.openSync(filePath, "w"), JSON.stringify(data, null, 2));
};

const main = () => {
  initPostsDestDir();
  initImageDestDir();

  // SOURCE_DIR 内の全アイテムを DEST_DIR にコピー
  fs.readdirSync(SOURCE_DIR).forEach((item) => {
    const srcPath = path.join(SOURCE_DIR, item);
    const destPath = path.join(DEST_DIR, item);

    // validate front matter
    const { data, content } = getMdDatas(srcPath);
    const meta = parseFrontMatter(item, data);
    if (!meta.published) {
      console.log(`Skipping unpublished post: ${item}`);
      return;
    }
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
    meta.tags.forEach((tag) => {
      if (!tagToSlugs[tag]) {
        tagToSlugs[tag] = [];
      }
      tagToSlugs[tag].push(meta.slug);
    });

    collectImageFiles(content);
    collectSoundFiles(content);
    collectMovieFiles(content);

    fs.cpSync(srcPath, destPath, { recursive: true });
  });

  const DATA_DIR = "src/data";
  overwriteJsonFile(path.join(DATA_DIR, "slug-to-title.json"), slugToTitle);
  overwriteJsonFile(path.join(DATA_DIR, "title-to-slug.json"), titleToSlug);
  // overwriteJsonFile(
  //   path.join(DATA_DIR, "slug-to-metadata.json"),
  //   slugToMetadata
  // );
  overwriteJsonFile(path.join(DATA_DIR, "tag-to-slugs.json"), tagToSlugs);
};

main();
