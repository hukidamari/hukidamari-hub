import * as fs from "fs";
import path from "path";

const IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
const SOUND_SOURCE_DIR = process.env.SOUND_SOURCE_DIR;
const MOVIE_SOURCE_DIR = process.env.MOVIE_SOURCE_DIR;
const THUMBNAIL_SOURCE_DIR = process.env.THUMBNAIL_SOURCE_DIR;
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
if (!THUMBNAIL_SOURCE_DIR) {
  console.error("Not Found THUMBNAIL_SOURCE_DIR env");
  process.exit(1);
}
const POST_ASSET_DEST_DIR = "public/post-assets"; // NOTE: must be same with config.POST_SSET_DEST_DIR
if (
  POST_ASSET_DEST_DIR === IMAGE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === SOUND_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === MOVIE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === THUMBNAIL_SOURCE_DIR
) {
  console.error(
    `You can't set ${POST_ASSET_DEST_DIR} as IMAGE_SOURCE_DIR, SOUND_SOURCE_DIR, MOVIE_SOURCE_DIR, or THUMBNAIL_SOURCE_DIR.`
  );
  process.exit(1);
}

export const initSourceDestDir = () => {
  fs.rmSync(POST_ASSET_DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(POST_ASSET_DEST_DIR, { recursive: true });
};

const encodeForURI = (text) => {
  return encodeURIComponent(text.replace(/\s/g, "-"));
};
const sourceWikiLinksRegex = (exts) => {
  // EX: exts = ["png", "jpg", "gif"]
  return new RegExp(`!\\[\\[(.+?)\\.(${exts.join("|")})\\]\\]`, "gi");
};
export const collectImageFiles = (content) => {
  collectSourceFiles(content, ["png", "jpg", "jpeg", "gif"], IMAGE_SOURCE_DIR);
};
export const collectSoundFiles = (content) => {
  collectSourceFiles(content, ["mp3", "wav"], SOUND_SOURCE_DIR);
};
export const collectMovieFiles = (content) => {
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

    collectSourceFile(srcPath, destPath);
  }
};
export const collectThumbnailFile = (thumbnailFm) => {
  if (!thumbnailFm) {
    return;
  }
  const regex = new RegExp(`\\[\\[(.+?)\\.(png|jpg|gif)\\]\\]`);
  const match = thumbnailFm.match(regex);

  const p1 = match[1];
  const ext = match[2];
  const parts = p1.split("|");
  const fileName = `${parts[0]}.${ext}`;
  const srcPath = path.join(THUMBNAIL_SOURCE_DIR, fileName);
  const destPath = path.join(POST_ASSET_DEST_DIR, encodeForURI(fileName));

  collectSourceFile(srcPath, destPath);

  if (ext === "gif" || ext === "png") {
    console.warn(
      `Large file: ${srcPath} is Successfuly copied but gif and png are not recommended for thumbnails. Please use jpg.`
    );
  }
};
const collectSourceFile = (srcPath, destPath) => {
  if (!fs.existsSync(srcPath)) {
    console.warn(`Not Found: source directory ${srcPath} is not found.`);
    return;
  }
  if (fs.existsSync(destPath)) {
    return;
  }

  const { size } = fs.statSync(srcPath);
  const sizeMB = size / (1024 * 1024);
  if (sizeMB > 1) {
    console.warn(`Large file (${sizeMB.toFixed(2)} MB): ${srcPath}`);
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.cpSync(srcPath, destPath);
};
