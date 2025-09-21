# RSS Reader

Fetches RSS feeds and generates a static HTML page with links from the feed.

## How to Use

_Requires minimum node v22.7.0_

- Clone this repo
- Create a `feeds.txt` file in the root directory that a URL on each line
- Open your terminal at the root directory and run `./main.js`
  - You might need to adjust file permissions, e.g. `chmod u+x main.js`
  - Alternatively, run `node main.js`
- Open `index.html` in your browser

### Example `feeds.txt`

```
https://html-css-tip-of-the-week.netlify.app/rss.xml
https://samwho.dev/rss.xml
```

## Debugging

If something isn't working as expected, you can pass a `DEBUG` env variable when running the script to generate text files in a `debug/` directory. These files will contain a list of the links parsed from a feed, and each feed's links will be written to their own file.
```
DEBUG=true ./main.js
```