#!/usr/bin/env node

import fs from "fs";
import { parseFeed } from "./lib/xml.js";
import { parseFeedsFile, writeHtmlDocument } from "./lib/file-service.js";
import {
  generateDocument,
  getFeedMarkup,
  getIndexMarkup,
} from "./lib/markup.js";

main();

async function main() {
  console.log("parsing feeds file...");
  const feeds = parseFeedsFile();
  console.log("feeds file parsed successfully!");

  try {
    console.log("fetching feed content...");
    const rawFeeds = await fetchFeeds(feeds);
    console.log("feed content fetched successfully!");

    console.log("parsing raw feeds...");
    const parsedFeeds = rawFeeds.map((feed) => parseFeed(feed));
    console.log("raw feeds parsed successfully!");

    console.log("generating markup...");
    parsedFeeds.forEach((feed) => {
      const feedContent = getFeedMarkup(feed);
      const feedPage = generateDocument(feed.title, feedContent);
      writeHtmlDocument(feed.title, feedPage);
    });
    const homepage = getIndexMarkup(parsedFeeds);
    writeHtmlDocument("index", homepage);
    console.log("index.html generated successfully!");
  } catch (error) {
    console.error("an unexpected error occurred: ", error);
  }
}

/**
 * @param {string[]} urls
 *
 * @returns {Promise<string[]>}
 */
async function fetchFeeds(urls) {
  const promises = urls.map((url) => fetchFeed(url));
  const responses = await Promise.allSettled(promises);

  const results = responses
    .filter((response) => response.status === "fulfilled")
    .map((response) => response.value);
  return results;
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
