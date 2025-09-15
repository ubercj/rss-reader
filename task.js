#!/usr/bin/env node

import fs from "fs";

console.log("parsing feeds...");

const rawFeeds = fs.readFileSync("feeds.json");
const feeds = JSON.parse(rawFeeds);

console.log("feeds parsed successfully");

console.log("generating markup...");

const timestamp = new Date().toISOString();

main();

async function main() {
  try {
    const doc = await generateDocument();
    fs.writeFileSync("index.html", doc);
  } catch (error) {
    console.error("error in main: ", error);
  }
}

async function generateDocument() {
  const parsedFeeds = await generateFeeds();

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

async function generateFeeds() {
  let result = "";

  for (const feed of feeds) {
    const rawFeed = await fetchFeed(feed.url);
    result += createFeedList(rawFeed, feed);
  }

  return result;
}

/*
  Lib
*/

/**
 * @typedef {object} Feed
 *
 * @prop {string} name
 * @prop {string} url
 * @prop {'item' | 'entry'} type
 */

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
 * @param {string} rawFeed
 * @param {Feed} feed
 *
 * @returns {string}
 */
function createFeedList(rawFeed, feed) {
  const parsedItems = parseXML(rawFeed, feed.name, feed.type);

  const itemsMarkup = parsedItems.map((item) => {
    return `<li>${parseRSSItem(item)}</li>`;
  });

  const feedMarkup = `
    <div class="feed">
      <h2>${feed.name}</h2>
      <ul>
        ${itemsMarkup.join("\n")}
      </ul>
    </div>
  `;
  return feedMarkup;
}

/**
 * @param {{ address: string; title: string}} item
 */
function parseRSSItem(item) {
  return `<a href="${item.address}" target="_blank">${item.title}</a>`;
}

/**
 * @param {string} input
 * @param {string} feedTitle
 * @param {Feed['type']} feedType
 *
 * @returns {Array<{ title: string; address: string }>}
 */
function parseXML(input, feedTitle, feedType) {
  const normalizedInput = normalizeInput(input);
  const itemMatcher = new RegExp(
    `\\<${feedType}.*?\\>(.*?)\\<\\/${feedType}\\>`,
    "g"
  );
  const itemMatches = normalizedInput.matchAll(itemMatcher);

  let parsedItems = [];
  for (const match of itemMatches) {
    const matchText = match[1];

    const itemTitle = getItemTitle(matchText);
    const itemAddress = getItemAddress(matchText, feedType);

    if (itemTitle && itemAddress) {
      parsedItems.push({ title: itemTitle, address: itemAddress });
    }
  }

  if (process.env.DEBUG) {
    generateDebugFile(feedTitle, parsedItems);
  }

  return parsedItems;
}

/**
 * @param {string} input
 *
 * @return {string}
 */
function normalizeInput(input) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .join("");
}

/**
 * @param {string} item
 * @param {Feed['type']} feedType
 *
 * @returns {string | undefined}
 */
function getItemAddress(item, feedType) {
  const addressTag = feedType === "item" ? "link" : "id";
  const addressMatcher = new RegExp(
    `\\<${addressTag}\\>(.*?)\\<\\/${addressTag}\\>`
  );

  const addressMatch = item.match(addressMatcher);
  return addressMatch[1];
}

/**
 * @param {string} item
 *
 * @returns {string | undefined}
 */
function getItemTitle(item) {
  const titleMatcher = /\<title\>(.*?)\<\/title\>/;
  const titleMatch = item.match(titleMatcher);

  return titleMatch[1]?.replaceAll(/\<!\[CDATA\[|\]\]\>/g, "");
}

/**
 *  @param {string} feedTitle
 *  @param {Array<{ title: string; address: string }>} items
 */
function generateDebugFile(feedTitle, items) {
  if (!fs.existsSync("debug")) {
    fs.mkdirSync("debug");
  }
  fs.writeFileSync(
    `debug/raw_feed_${feedTitle.replaceAll(/\s/g, "_")}.txt`,
    items.map((i) => JSON.stringify(i)).join("\n")
  );
}
