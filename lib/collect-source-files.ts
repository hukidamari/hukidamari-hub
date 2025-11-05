import * as fs from "fs";
import path from "path";
import {
  POST_ASSET_DEST_DIR,
  IMAGE_SOURCE_DIR,
  MOVIE_SOURCE_DIR,
  SOUND_SOURCE_DIR,
  THUMBNAIL_SOURCE_DIR,
} from "../config/path";
import { encodeForURI } from "./path-utils";
import {
  IMAGE_EXTENSIONS,
  MOVIE_EXTENSIONS,
  SOUND_EXTENSIONS,
} from "../config/extensions";

export const initSourceDestDir = () => {
  fs.rmSync(POST_ASSET_DEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(POST_ASSET_DEST_DIR, { recursive: true });
};

const sourceWikiLinksRegex = (exts: string[]) => {
  // EX: exts = ["png", "jpg", "gif"]
  return new RegExp(`!\\[\\[(.+?)\\.(${exts.join("|")})\\]\\]`, "gi");
};
export const collectImageFiles = (content: string) => {
  collectSourceFiles(content, IMAGE_EXTENSIONS, IMAGE_SOURCE_DIR);
};
export const collectSoundFiles = (content: string) => {
  collectSourceFiles(content, SOUND_EXTENSIONS, SOUND_SOURCE_DIR);
};
export const collectMovieFiles = (content: string) => {
  collectSourceFiles(content, MOVIE_EXTENSIONS, MOVIE_SOURCE_DIR);
};
const collectSourceFiles = (
  content: string,
  exts: string[],
  sourceDir: string
) => {
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
export const collectThumbnailFile = (thumbnailFm: string) => {
  if (!thumbnailFm) {
    return;
  }
  const regex = new RegExp(`\\[\\[(.+?)\\.(png|jpg|gif)\\]\\]`);
  const match = thumbnailFm.match(regex);

  if (!match) {
    return;
  }

  const p1 = match[1];
  const ext = match[2];
  const parts = p1.split("|");
  const fileName = `${parts[0]}.${ext}`;
  const srcPath = path.join(THUMBNAIL_SOURCE_DIR, fileName);
  const destPath = path.join(POST_ASSET_DEST_DIR, encodeForURI(fileName));

  collectSourceFile(srcPath, destPath);

  if (ext === "gif" || ext === "png") {
    console.warn(`Large file: ${srcPath} success BUT You should use jpg.`);
  }
};
const collectSourceFile = (srcPath: string, destPath: string) => {
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
