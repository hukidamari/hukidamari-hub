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
const collectImageFiles = (content) => {
  const matches = content.matchAll(/\!\[\[(.+?)\.(png|jpe?g)\]\]/gi);

  for (const match of matches) {
    const p1 = match[1];
    const ext = match[2];
    const parts = p1.split("|");
    const fileName = `${parts[0]}.${ext}`;
    const srcPath = path.join(IMAGE_SOURCE_DIR, fileName);
    const destPath = path.join(IMAGE_DEST_DIR, fileName);

    if (!fs.existsSync(srcPath)) {
      console.warn(`Not Found: Image ${srcPath} is not found.`);
      continue;
    }
    if (fs.existsSync(destPath)) {
      continue;
    }

    const { size } = fs.statSync(srcPath);
    const sizeMB = size / (1024 * 1024);
    if (sizeMB > 1) {
      console.warn(`Large image (${sizeMB.toFixed(2)} MB): ${srcPath}`);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath);
  }
};
const initImageDestDir = () => {
  fs.rmSync(IMAGE_DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(IMAGE_DEST_DIR, { recursive: true });
};
const initPostsDestDir = () => {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DEST_DIR, { recursive: true });
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

    collectImageFiles(content);
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
