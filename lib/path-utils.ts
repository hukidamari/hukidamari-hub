import * as fs from "fs";
import path from "path";
import { POST_ASSET_DEST_DIR } from "../config/path";

export const existsPublicFile = (fileName: string): boolean => {
  return fs.existsSync(path.join(POST_ASSET_DEST_DIR, fileName));
};

export const publicFileNameToUrl = (fileName: string): string => {
  return `/post-assets/${encodeForURI(fileName)}`;
};

export const encodeForURI = (text: string) => {
  return encodeURIComponent(text.replace(/\s/g, "-"));
};
