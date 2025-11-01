const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

require("dotenv").config();

const SOURCE_DIR = process.env.POSTS_SOURCE_DIR;
const DEST_DIR = process.env.POSTS_DEST_DIR;
const IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
const IMAGE_DEST_DIR = process.env.IMAGE_DEST_DIR;
if (!SOURCE_DIR) {
  console.error("Not Found SOURCE_DIR env");
  process.exit(1);
}
if (!DEST_DIR) {
  console.error("Not Found POSTS_DEST_DIR env");
  process.exit(1);
}
if (!IMAGE_SOURCE_DIR) {
  console.error("Not Found IMAGE_SOURCE_DIR env");
  process.exit(1);
}
if (!IMAGE_DEST_DIR) {
  console.error("Not Found IMAGE_DEST_DIR env");
  process.exit(1);
}
let titleToSlug = {};
let slugToTitle = {};

const getMdDatas = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return matter(fileContent);
};
const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);
const collectImageFiles = (content) => {};

const main = () => {
  // posts ディレクトリを削除して再作成
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEST_DIR, { recursive: true });

  // SOURCE_DIR 内の全アイテムを DEST_DIR にコピー
  fs.readdirSync(SOURCE_DIR).forEach((item) => {
    const srcPath = path.join(SOURCE_DIR, item);
    const destPath = path.join(DEST_DIR, item);

    // validate front matter
    const { data, content } = getMdDatas(srcPath);
    if (!data.published) {
      console.log(`Skipping unpublished post: ${item}`);
      return;
    }
    if (!data.slug) {
      console.warn(`Warning: Post "${item}" is missing a slug. Skipping.`);
      return;
    }
    if (!isValidSlug(data.slug)) {
      console.warn(`Warning: Post "${item}" has unvalid slug. Skipping.`);
      return;
    }
    const title = item.replace(".md", "");
    slugToTitle[data.slug] = title;
    titleToSlug[title] = data.slug;

    fs.cpSync(srcPath, destPath, { recursive: true });
  });

  const DATA_DIR = "src/data";
  fs.writeFileSync(
    fs.openSync(path.join(DATA_DIR, "slug-to-title.json"), "w"),
    JSON.stringify(slugToTitle, null, 2)
  );
  fs.writeFileSync(
    fs.openSync(path.join(DATA_DIR, "title-to-slug.json"), "w"),
    JSON.stringify(titleToSlug, null, 2)
  );
};

main();
