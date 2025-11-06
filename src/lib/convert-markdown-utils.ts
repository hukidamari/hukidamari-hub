import { PostSlug } from "../../types/post";
import { getPostAssetUrlByFilename } from "./routes";

export const embedPageGenerator = (alt: string, url: PostSlug): string => {
  return pageLinkGenerator(alt, url);
};
export const embedImageGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<img src="${url}" alt="${basename}"></img>`;
};
export const embedSoundGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<audio src="${url}" controls></audio>`;
};
export const embedMovieGenerator = (basename: string, ext: string): string => {
  const filename = `${basename}.${ext}`;
  const url = getPostAssetUrlByFilename(filename);
  return `<video src="${url}" controls></video>`;
};
export const pageLinkGenerator = (alt: string, url: string): string => {
  return `<a href="${url}">${alt}</a>`;
};
export const imageLinkGenerator = (basename: string, ext: string): string => {
  return embedImageGenerator(basename, ext);
};
export const soundLinkGenerator = (basename: string, ext: string): string => {
  return embedSoundGenerator(basename, ext);
};
export const movieLinkGenerator = (basename: string, ext: string): string => {
  return embedMovieGenerator(basename, ext);
};
