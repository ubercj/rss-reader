# RSS Reader

Fetches RSS feeds and generates a static HTML page with links from the feed.

<img width="1139" height="723" alt="Screen Shot 2025-09-21 at 5 17 10 PM" src="https://github.com/user-attachments/assets/fe5a905c-8436-48c9-bf97-be1f165e355b" />

## How to Use

_Requires minimum node v22.7.0_

- Clone this repo
- Create a `feeds.txt` file in the root directory that includes a feed URL on each line (i.e. newline delimited)
- Open your terminal at the root directory and run `./main.js`
  - You might need to adjust file permissions, e.g. `chmod u+x main.js`
  - Alternatively, run `node main.js`
- Open `index.html` in your browser

### Example `feeds.txt`

```
https://adrianroselli.com/feed
https://html-css-tip-of-the-week.netlify.app/rss.xml
https://samwho.dev/rss.xml
```

## Debugging

If something isn't working as expected, you can pass a `DEBUG` env variable when running the script to generate a text file for each feed that lists the raw entries.
```
DEBUG=true ./main.js
```
