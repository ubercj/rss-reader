# RSS Reader

Fetches RSS feeds and generates a static HTML page with links from the feed.

## How to Use

- Clone this repo
- Create a `feeds.json` file in the root directory that contains an array of feeds
- Open your terminal at the root directory and run `./task.js`
  - You might need to adjust file permissions, e.g. `chmod u+x task.js`
- Open `index.html` in your browser

### Example feed JSON

```js
{
  // The heading for the list of links from this feed
  "name": "HTML & CSS Tip of the Week",
  // The URL used to fetch the RSS feed
  "url": "https://html-css-tip-of-the-week.netlify.app/rss.xml",
  // The name of the XML tag that contains each RSS item. Currently, "item" is your best bet. More support may come in the future.
  "type": "item"
}
```
