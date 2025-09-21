import fs from "fs";

/**
 * @returns {string[]}
 */
export function parseFeedsFile() {
  const rawFeeds = fs.readFileSync("feeds.txt", { encoding: "utf8" });
  return rawFeeds.split("\n");
}

/**
 *  @param {string} feedTitle
 *  @param {import('./xml').FeedEntry[]} entries
 */
export function generateDebugFile(feedTitle, entries) {
  if (!fs.existsSync("debug")) {
    fs.mkdirSync("debug");
  }
  fs.writeFileSync(
    `debug/raw_feed_${feedTitle.replaceAll(/\s/g, "_")}.txt`,
    entries.map((i) => JSON.stringify(i)).join("\n")
  );
}
