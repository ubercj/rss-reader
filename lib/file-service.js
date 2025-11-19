import fs from "fs";

/**
 * @param {string} fileName
 *
 * @returns {string[]}
 */
export function parseFeedsFile(fileName) {
  const rawFeeds = fs.readFileSync(fileName, { encoding: "utf8" });
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

/**
 * @param {string} fileName
 * @param {string} content
 * @param {string} [outputDir] - Default is `dist`
 */
export function writeHtmlDocument(fileName, content, outputDir = "dist") {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filePath = `${outputDir}/${fileName}.html`;
  fs.writeFileSync(filePath, content);
}
