import { generateDebugFile } from "./file-service.js";

/**
 * @typedef {'RSS' | 'Atom'} FeedType
 */

/**
 * @typedef {object} FeedEntry
 *
 * @prop {string} title
 * @prop {string} link
 * @prop {string} [description]
 */

/**
 * @typedef {object} Feed
 *
 * @prop {string} title
 * @prop {FeedEntry[]} entries
 */

const RSS_TAG_MATCHER = /\<rss.*?\>/;
const ATOM_TAG_MATCHER = /\<feed.*?\>/;

const TITLE_MATCHER = /\<title\>(.*?)\<\/title\>/;

const RSS_ENTRY_MATCHER = /\<item.*?\>(.*?)\<\/item\>/g;
const ATOM_ENTRY_MATCHER = /\<entry.*?\>(.*?)\<\/entry\>/g;

const RSS_LINK_MATCHER = /\<link\>(.*?)\<\/link\>/;
const ATOM_LINK_MATCHER = /\<link.*?(href=".*?").*?\/\>/;

const RSS_DESCRIPTION_MATCHER = /\<description\>(.*?)\<\/description\>/;
const ATOM_DESCRIPTION_MATCHER = /\<summary\>(.*?)\<\/summary\>/;

/**
 * @param {string} rawFeed
 *
 * @returns {Feed}
 */
export function parseFeed(rawFeed) {
  const normalizedFeed = normalizeInput(rawFeed);

  const feedType = getFeedType(normalizedFeed);
  const feedTitle = getTitle(normalizedFeed);
  const entries = getFeedEntries(feedType, normalizedFeed);

  if (process.env.DEBUG) {
    generateDebugFile(feedTitle, entries);
  }

  return {
    title: feedTitle,
    entries,
  };
}

/**
 * @param {string} rawFeed
 *
 * @returns {FeedType}
 */
function getFeedType(rawFeed) {
  if (RSS_TAG_MATCHER.test(rawFeed)) {
    return "RSS";
  }

  if (ATOM_TAG_MATCHER.test(rawFeed)) {
    return "Atom";
  }

  throw new Error("Unrecognized feed type");
}

/**
 * @param {string} rawText
 *
 * @returns {string}
 */
function getTitle(rawText) {
  const titleMatch = rawText.match(TITLE_MATCHER);
  const parsed = titleMatch[1].replaceAll(/\<!\[CDATA\[|\]\]\>/g, "");
  return sanitize(parsed);
}

/**
 * @param {FeedType} feedType
 * @param {string } rawFeed
 *
 * @returns {FeedEntry[]}
 */
function getFeedEntries(feedType, rawFeed) {
  const entryMatcher =
    feedType === "RSS" ? RSS_ENTRY_MATCHER : ATOM_ENTRY_MATCHER;
  const entryMatches = rawFeed.matchAll(entryMatcher);

  let parsedEntries = [];
  for (const match of entryMatches) {
    const rawEntry = match[1];

    const title = getTitle(rawEntry);
    const link = getLink(feedType, rawEntry);
    const description = getDescription(feedType, rawEntry);

    if (title && link) {
      parsedEntries.push({ title, link, description });
    }
  }

  return parsedEntries;
}

/**
 * @param {FeedType} feedType
 * @param {string} rawEntry
 *
 * @returns {string | undefined}
 */
function getLink(feedType, rawEntry) {
  const matcher = feedType === "RSS" ? RSS_LINK_MATCHER : ATOM_LINK_MATCHER;
  const addressMatch = rawEntry.match(matcher);
  return sanitize(addressMatch[1]);
}

/**
 * @param {FeedType} feedType
 * @param {string} rawEntry
 *
 * @returns {string | undefined}
 */
function getDescription(feedType, rawEntry) {
  const descriptionMatcher =
    feedType === "RSS" ? RSS_DESCRIPTION_MATCHER : ATOM_DESCRIPTION_MATCHER;
  const descriptionMatch = rawEntry.match(descriptionMatcher);

  if (!descriptionMatch?.[1]) {
    return undefined;
  }

  const parsed = descriptionMatch[1]
    .replaceAll(/\<!\[CDATA\[|\]\]\>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;nbsp;", "");

  return sanitize(parsed);
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

const ATTR_BLACKLIST = [
  "style",
  "onclick",
  "onfocus",
  "onblur",
  "onerror",
  "onmousedown",
  "onmouseup",
  "onmouseenter",
  "onmouseleave",
  "onmouseover",
  "onmousemove",
];

const blacklistedAttrMatcher = new RegExp(
  `(${ATTR_BLACKLIST.join("|")})=".*?"`,
  "g"
);

/**
 * @param {string} input
 *
 * @returns {string}
 */
function sanitize(input) {
  const noAttrs = input.replaceAll(blacklistedAttrMatcher, "");
  const noAttrsNoScript = noAttrs.replaceAll(/\<script\>.*?\<\/script\>/g, "");

  return noAttrsNoScript;
}
