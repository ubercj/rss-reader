/**
 * @param {import('./xml.js').Feed[]} feeds
 */
export function getIndexMarkup(feeds) {
  const tableOfContents = createTableOfContents(feeds);
  const timestamp = new Date().toLocaleString();

  const content = `
    <p>Generated ${timestamp}</p>

    <nav>
      <h2>Table of Contents</h2>
      ${tableOfContents}
    </nav>
  `;
  return generateDocument("RSS Reader", content);
}

/**
 * @param {string} title
 * @param {string} content
 */
export function generateDocument(title, content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="favicon.svg" />
      <link href="style.css" rel="stylesheet" />
      <title>${title}</title>
    </head>
    <body>
      <main id="main" class="container">
        <h1>${title}</h1>
        ${content}
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
    result += `<li><a href="${feed.title}.html">${feed.title}</a></li>\n`;
  });

  return result;
}

/**
 * @param {import('./xml.js').Feed} feed
 *
 * @returns {string}
 */
export function getFeedMarkup(feed) {
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
      <a href="index.html" class="back-link">Back to feeds list</a>
      <ul>
        ${listItems.join("")}
      </ul>
    </div>
  `;
}
