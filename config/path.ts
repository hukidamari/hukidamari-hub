export const POSTS_DIR = "posts";
export const POST_ASSET_DEST_DIR = "public/post-assets";
export const DATA_DIR = "data";

const _IMAGE_SOURCE_DIR = process.env.IMAGE_SOURCE_DIR;
const _SOUND_SOURCE_DIR = process.env.SOUND_SOURCE_DIR;
const _MOVIE_SOURCE_DIR = process.env.MOVIE_SOURCE_DIR;
const _THUMBNAIL_SOURCE_DIR = process.env.THUMBNAIL_SOURCE_DIR;
const _POST_SOURCE_DIR = process.env.POST_SOURCE_DIR;

if (!_POST_SOURCE_DIR) {
  console.error("Not Found POST_SOURCE_DIR env");
  process.exit(1);
}
if (!_IMAGE_SOURCE_DIR) {
  console.error("Not Found IMAGE_SOURCE_DIR env");
  process.exit(1);
}
if (!_SOUND_SOURCE_DIR) {
  console.error("Not Found SOUND_SOURCE_DIR env");
  process.exit(1);
}
if (!_MOVIE_SOURCE_DIR) {
  console.error("Not Found MOVIE_SOURCE_DIR env");
  process.exit(1);
}
if (!_THUMBNAIL_SOURCE_DIR) {
  console.error("Not Found THUMBNAIL_SOURCE_DIR env");
  process.exit(1);
}
if (
  POST_ASSET_DEST_DIR === _IMAGE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === _SOUND_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === _MOVIE_SOURCE_DIR ||
  POST_ASSET_DEST_DIR === _THUMBNAIL_SOURCE_DIR
) {
  console.error(
    `You can't set ${POST_ASSET_DEST_DIR} as IMAGE_SOURCE_DIR, SOUND_SOURCE_DIR, MOVIE_SOURCE_DIR, or THUMBNAIL_SOURCE_DIR.`
  );
  process.exit(1);
}
if (_POST_SOURCE_DIR === POSTS_DIR) {
  console.error(`You can't set ${POSTS_DIR} as POSTS_SOURCE_DIR.`);
  process.exit(1);
}

export const IMAGE_SOURCE_DIR = _IMAGE_SOURCE_DIR;
export const SOUND_SOURCE_DIR = _SOUND_SOURCE_DIR;
export const MOVIE_SOURCE_DIR = _MOVIE_SOURCE_DIR;
export const THUMBNAIL_SOURCE_DIR = _THUMBNAIL_SOURCE_DIR;
export const POST_SOURCE_DIR = _POST_SOURCE_DIR;
