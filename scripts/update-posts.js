const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SOURCE_DIR = "I:/Obsidian/NolaBlogTest/NolaBlog";
const DEST_DIR = "posts";
let titleToSlug = {};
let slugToTitle = {};

const getFrontMatter = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);
  return data;
};
const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);

// posts ディレクトリを削除して再作成
fs.rmSync(DEST_DIR, { recursive: true, force: true });
fs.mkdirSync(DEST_DIR, { recursive: true });

// SOURCE_DIR 内の全アイテムを DEST_DIR にコピー
fs.readdirSync(SOURCE_DIR).forEach((item) => {
  const srcPath = path.join(SOURCE_DIR, item);
  const destPath = path.join(DEST_DIR, item);

  // validate front matter
  const frontMatter = getFrontMatter(srcPath);
  if (!frontMatter.published) {
    console.log(`Skipping unpublished post: ${item}`);
    return;
  }
  if (!frontMatter.slug) {
    console.warn(`Warning: Post "${item}" is missing a slug. Skipping.`);
    return;
  }
  if (!isValidSlug(frontMatter.slug)) {
    console.warn(`Warning: Post "${item}" has unvalid slug. Skipping.`);
    return;
  }
  const title = item.replace(".md", "");
  slugToTitle[frontMatter.slug] = title;
  titleToSlug[title] = frontMatter.slug;

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
