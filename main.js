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
  const tableOfContents = createTableOfContents(feeds);
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
      <main id="main" class="container">
        <h1>RSS Reader</h1>
        <p>Generated ${timestamp}</p>

        <nav>
          <h2>Table of Contents</h2>
          ${tableOfContents}
        </nav>

        <div id="feed">
          ${parsedFeeds}
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
  let parsed = "";

  const promises = feeds.map((feed) => fetchFeed(feed.url));
  const results = await Promise.allSettled(promises);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const feedMatch = feeds[index];
      parsed += createFeedList(result.value, feedMatch);
    }
  });

  return parsed;
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

/**
 * @param {Feed[]} feeds
 *
 * @returns {string}
 */
function createTableOfContents(feeds) {
  let result = "";

  feeds.forEach((feed) => {
    result += `<li><a href="#${feed.name}">${feed.name}</a></li>`;
  });

  return result;
}
