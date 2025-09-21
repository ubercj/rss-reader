/**
 * @param {import('./xml.js').Feed[]} feeds
 */
export function generateDocument(feeds) {
  const tableOfContents = createTableOfContents(feeds);
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

        <div id="feeds">
          ${feeds.map((feed) => getFeedMarkup(feed)).join("")}
        </div>
      </main>
    </body>
  </html>
`;
}

/**
 * @param {import('./xml.js').Feed[]} feeds
 *
 * @returns {string}
 */
function createTableOfContents(feeds) {
  let result = "";

  feeds.forEach((feed) => {
    result += `<li><a href="#${feed.title}">${feed.title}</a></li>`;
  });

  return result;
}

/**
 * @param {import('./xml.js').Feed} feed
 *
 * @returns {string}
 */
function getFeedMarkup(feed) {
  const listItems = feed.entries?.map((entry) => {
    return `
      <li>  
        <a href="${entry.link}" target="_blank">${entry.title}</a>
        ${
          entry.description
            ? `<div class="item-description">${entry.description}</div>`
            : ""
        }
      </li>
    `;
  });

  return `
    <div class="feed">
      <h2 id="${feed.title}">${feed.title}</h2>
      <ul>
        ${listItems.join("")}
      </ul>
    </div>
  `;
}
