const itemsEl = document.getElementById("feed");
const fetchSWButton = document.getElementById("fetch-sw-button");
if (fetchSWButton) {
  fetchSWButton.onclick = () =>
    fetchFeed(SW_FEED, { itemSelector: "entry", linkSelector: "id" });
}
const fetchCAButton = document.getElementById("fetch-ca-button");
if (fetchCAButton) {
  fetchCAButton.onclick = () => fetchFeed(CA_FEED);
}
const fetchFOFButton = document.getElementById("fetch-fof-button");
if (fetchFOFButton) {
  fetchFOFButton.onclick = () => fetchFeed(FOF_FEED);
}

/**
 * @typedef {object} FeedOptions
 *
 * @prop {string} [itemSelector]
 * @prop {string} [titleSelector]
 * @prop {string} [linkSelector]
 */

/**
 * @param {string} url
 * @param {FeedOptions} options
 */
async function fetchFeed(url, options) {
  const resolvedOptions = {
    itemSelector: options?.itemSelector ?? "item",
    titleSelector: options?.titleSelector ?? "title",
    linkSelector: options?.linkSelector ?? "link",
  };

  try {
    const response = await fetch(url);

    if (response.ok) {
      const rawFeed = await response.text();
      const listEl = createFeedList(rawFeed, resolvedOptions);
      itemsEl.insertAdjacentElement("beforeend", listEl);
    } else {
      console.error("response was not ok");
    }
  } catch (error) {
    console.error("an error occurred: ", error);
  }
}

/**
 * @param {string} rawFeed
 * @param {FeedOptions} options
 *
 * @returns {HTMLUListElement}
 */
function createFeedList(rawFeed, options) {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(rawFeed, "text/xml");

  const items = parsedData.querySelectorAll(options.itemSelector);

  const listEl = document.createElement("ul");
  items.forEach((item) => {
    const newListItem = document.createElement("li");
    const newAnchor = parseRSSItem(item, options);

    newListItem.appendChild(newAnchor);
    listEl.appendChild(newListItem);
  });

  return listEl;
}

/**
 * @param {HTMLElement} item
 * @param {FeedOptions} options
 *
 * @returns {HTMLAnchorElement}
 */
function parseRSSItem(item, options) {
  const text = item.querySelector(options.titleSelector).textContent;
  const dest = item.querySelector(options.linkSelector).textContent;

  const newAnchor = document.createElement("a");
  newAnchor.textContent = text;
  newAnchor.href = dest;
  newAnchor.target = "_blank";

  return newAnchor;
}
