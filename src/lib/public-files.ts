import { IMAGES_DIR } from "@/config/path";
import * as fs from "fs";
import path from "path";

export const existsPublicImage = (fileName: string): boolean => {
  return fs.existsSync(path.join(IMAGES_DIR, encodeForURI(fileName)));
};

export const imageFileNameToUrl = (fileName: string): string => {
  return `/images/${encodeForURI(fileName)}`;
};

const encodeForURI = (text: string) => {
  return encodeURIComponent(text.replace(/\s/g, "-"));
};
