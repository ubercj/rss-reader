#!/usr/bin/env node

import fs from "fs";
import { createFeedList } from "./lib/xml.js";
import { parseFeedsFile } from "./lib/file-service.js";

main();

async function main() {
  console.log("parsing feeds...");
  const feeds = parseFeedsFile();
  console.log("feeds parsed successfully!");

  try {
    console.log("generating markup...");
    const doc = await generateDocument(feeds);
    fs.writeFileSync("index.html", doc);
    console.log("index.html generated successfully!");
  } catch (error) {
    console.error("an unexpected error occurred: ", error);
  }
}

/**
 * @param {Feed[]} feeds
 */
async function generateDocument(feeds) {
  const parsedFeeds = await parseFeeds(feeds);
  const timestamp = new Date().toLocaleString();

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="./style.css" rel="stylesheet" />
      <title>RSS Reader</title>
    </head>
    <body>
      <main id="main">
        <h1>RSS Reader</h1>
        <p>Last updated ${timestamp}</p>

        <div class="container">
          <div id="feed">
            ${parsedFeeds}
          </div>
        </div>
      </main>
    </body>
  </html>
`;
}

/**
 * @param {Feed[]} feeds
 *
 * @returns {Promise<string>}
 */
async function parseFeeds(feeds) {
  let result = "";

  for (const feed of feeds) {
    const rawFeed = await fetchFeed(feed.url);
    result += createFeedList(rawFeed, feed);
  }

  return result;
}

/**
 * @param {string} url
 *
 * @returns {Promise<string>}
 */
async function fetchFeed(url) {
  try {
    const response = await fetch(url);

    if (response.ok) {
      return await response.text();
    } else {
      console.error("response was not ok");
      return "";
    }
  } catch (error) {
    console.error("an error occurred: ", error);
    return "";
  }
}
