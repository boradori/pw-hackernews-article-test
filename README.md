### How To Run

This repo contains a Playwright test that validates the dates of the articles in [Hacker News](https://news.ycombinator.com/).

1. Install node modules by running `npm i`.

2. You may need to install Playwright by running `npx playwright install`.

3. You can run your script with the `node index.js` command.

`index.js` file opens [Hacker News/newest](https://news.ycombinator.com/newest) and validates that the first 100 articles are sorted from newest to oldest.
