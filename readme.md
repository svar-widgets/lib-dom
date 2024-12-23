# wx-lib-dom

wx-lib-dom is a library that provides base helpers for DOM operations.


![NPM package](https://img.shields.io/npm/v/wx-lib-dom)

## Running Tests

The library includes Playwright-based tests that are executed automatically by CI. To run these tests locally, you need to prepare Playwright by installing the Chromium browser.

1. Initialize Playwright:

   ```sh
   # install all supported browsers
   yarn playwright init

   # or install Chromium only
   yarn playwright install chromium
   ```

2. Run the tests:
   ```sh
   yarn test
   ```

