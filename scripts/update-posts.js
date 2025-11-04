require("dotenv").config();

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  collectImageFiles,
  collectSoundFiles,
  collectMovieFiles,
  initSourceDestDir,
} = require("./collect-source-files");

const SOURCE_DIR = process.env.POSTS_SOURCE_DIR;
if (!SOURCE_DIR) {
  console.error("Not Found SOURCE_DIR env");
  process.exit(1);
}
const DEST_DIR = "posts"; // NOTE: must be same with config.DEST_DIR
const titleToSlug = {};
const slugToTitle = {};
const slugToMetadata = {};
const tagToSlugs = {};

const getMdDatas = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};
const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);
const initPostsDestDir = () => {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEST_DIR, { recursive: true });
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
  initSourceDestDir();

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
