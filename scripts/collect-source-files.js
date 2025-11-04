const fs = require("fs");
const path = require("path");

const IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
const SOUND_SOURCE_DIR = process.env.SOUND_SOURCE_DIR;
const MOVIE_SOURCE_DIR = process.env.MOVIE_SOURCE_DIR;
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
const POST_ASSET_DEST_DIR = "public/post-assets"; // NOTE: must be same with config.POST_SSET_DEST_DIR

const initSourceDestDir = () => {
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

module.exports = {
  collectImageFiles,
  collectSoundFiles,
  collectMovieFiles,
  initSourceDestDir,
};
