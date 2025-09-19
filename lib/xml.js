import { generateDebugFile } from "./file-service.js";

/**
 * @param {string} rawFeed
 * @param {Feed} feed
 *
 * @returns {string}
 */
export function createFeedList(rawFeed, feed) {
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
  return sanitize(addressMatch[1]);
}

/**
 * @param {string} item
 *
 * @returns {string | undefined}
 */
function getItemTitle(item) {
  const titleMatcher = /\<title\>(.*?)\<\/title\>/;
  const titleMatch = item.match(titleMatcher);

  const parsed = titleMatch[1]?.replaceAll(/\<!\[CDATA\[|\]\]\>/g, "");
  return sanitize(parsed);
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
