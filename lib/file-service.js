import fs from "fs";

/**
 * @typedef {object} Feed
 *
 * @prop {string} name
 * @prop {string} url
 * @prop {'item' | 'entry'} type
 */

/**
 * @returns {Feed[]}
 */
export function parseFeedsFile() {
  try {
    const rawFeeds = fs.readFileSync("feeds.json");
    return JSON.parse(rawFeeds);
  } catch (error) {
    console.error("error parsing feeds.json: ", error);
    return [];
  }
}

/**
 *  @param {string} feedTitle
 *  @param {Array<{ title: string; address: string }>} items
 */
export function generateDebugFile(feedTitle, items) {
  if (!fs.existsSync("debug")) {
    fs.mkdirSync("debug");
  }
  fs.writeFileSync(
    `debug/raw_feed_${feedTitle.replaceAll(/\s/g, "_")}.txt`,
    items.map((i) => JSON.stringify(i)).join("\n")
  );
}
