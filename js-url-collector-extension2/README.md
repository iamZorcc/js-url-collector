# JS URL Collector - Chrome Extension

A Chrome extension that collects JavaScript URLs from network requests and allows you to filter by domain and copy them easily.

## Features

- **Automatic Collection**: Automatically captures all JavaScript URLs from network requests while browsing
- **Domain Filtering**: Filter collected URLs by domain (e.g., `target.com`)
- **Easy Copy**: Click any URL to copy it, or copy all filtered URLs at once
- **Toggle On/Off**: Enable or disable collection with a simple toggle
- **Clean UI**: Modern, easy-to-use interface

## Installation

### Method 1: Load as Unpacked Extension (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked**
4. Select the `js-url-collector-extension` folder
5. The extension icon will appear in your toolbar

### Method 2: Pack the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Pack extension**
4. Select the `js-url-collector-extension` folder as the extension root
5. Chrome will create a `.crx` file you can install

## Usage

1. **Enable Collection**: Make sure the toggle is set to "Enabled"
2. **Browse Websites**: Visit any website and the extension will automatically collect JavaScript URLs
3. **Filter by Domain**: Enter a domain (e.g., `google.com`) in the filter box to show only URLs from that domain
4. **Copy URLs**: 
   - Click on any URL to copy it individually
   - Click "Copy All Filtered" to copy all filtered URLs at once
5. **Clear Data**: Click "Clear All" to remove all collected URLs
6. **Refresh**: Click the refresh button to reload the URL list

## Tips

- Use partial domain names for filtering (e.g., `cdn` will match all CDN domains)
- URLs are sorted by time (newest first)
- Hover over URLs to see the full path
- The extension stores up to 1000 URLs to prevent performance issues

## Permissions

- `webRequest`: To monitor network requests for JavaScript files
- `storage`: To save collected URLs locally
- `activeTab`: To interact with the current tab
- `<all_urls>`: To monitor requests on all websites

## Files Structure

```
js-url-collector-extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for capturing requests
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup functionality
├── README.md          # This file
└── icons/
    ├── icon16.png     # 16x16 icon
    ├── icon32.png     # 32x32 icon
    ├── icon48.png     # 48x48 icon
    └── icon128.png    # 128x128 icon
```

## Troubleshooting

**No URLs are being collected:**
- Make sure the extension is enabled (toggle shows "Enabled")
- Refresh the webpage you're browsing
- Check that you have the required permissions

**Extension not working after update:**
- Go to `chrome://extensions/`
- Click the refresh icon on the extension card
- Or remove and re-load the extension

**Too many URLs:**
- Use the domain filter to narrow down results
- Click "Clear All" to reset and start fresh

## License

MIT License - Feel free to modify and distribute.
