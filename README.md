# RSS Reader

Fetches RSS feeds and generates a static HTML page with links from the feed.

## How to Use

_Requires minimum node v22.7.0_

- Clone this repo
- Create a `feeds.json` file in the root directory that contains an array of feeds
- Open your terminal at the root directory and run `./main.js`
  - You might need to adjust file permissions, e.g. `chmod u+x main.js`
- Open `index.html` in your browser

### Example feed `feeds.json`

```js
[
  {
    // The heading for the list of links from this feed
    "name": "HTML & CSS Tip of the Week",
    // The URL used to fetch the RSS feed
    "url": "https://html-css-tip-of-the-week.netlify.app/rss.xml",
    // The name of the XML tag that contains each RSS item. It's usually "item".
    "type": "item"
  },
  {
    "name": "Sam Who Blog",
    "url": "https://samwho.dev/rss.xml",
    // "entry" indicates that the feed needs some special treatment (I'm not sure why, maybe an older version of the RSS spec?). I might flesh out support for this in the future.
    "type": "entry"
  }
]
```

## Debugging

If something isn't working as expected, you can pass a `DEBUG` env variable when running the script to generate text files in a `debug/` directory. These files will contain a list of the links parsed from a feed, and each feed's links will be written to their own file.
```
DEBUG=true ./task
```