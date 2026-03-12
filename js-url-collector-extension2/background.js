// JS URL Collector - Background Service Worker
// Captures JavaScript URLs from all network requests

// Store for collected JS URLs
let jsUrls = new Map(); // Using Map to avoid duplicates with URL as key

// Track enabled state in memory for fast access
let isEnabled = true;

// Initialize on extension load
chrome.runtime.onInstalled.addListener(() => {
  console.log('JS URL Collector installed');
  // Set default enabled state
  chrome.storage.local.set({ jsUrls: [], isEnabled: true });
  isEnabled = true;
});

// Listen for web requests and capture JavaScript files
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    // CRITICAL: Check if collection is enabled BEFORE processing
    if (!isEnabled) {
      return; // Skip if disabled
    }
    
    const url = details.url;
    
    // Check if it's a JavaScript file by extension or content-type
    const isJsByUrl = /\.(js|mjs|jsx|ts|tsx)(\?|$)/i.test(url);
    
    // Also check for common JS CDN patterns and dynamic JS loading
    const isJsByPattern = /\/js\/|\/javascript\/|\/scripts?\//i.test(url);
    
    if (isJsByUrl || isJsByPattern) {
      // Extract domain from URL
      let domain = '';
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
      } catch (e) {
        domain = 'unknown';
      }
      
      // Store the URL with metadata
      const urlData = {
        url: url,
        domain: domain,
        timestamp: Date.now(),
        method: details.method,
        type: details.type
      };
      
      // Only add if not already exists
      if (!jsUrls.has(url)) {
        jsUrls.set(url, urlData);
        
        // Save to storage (limit to last 1000 URLs to avoid storage limits)
        saveToStorage();
      }
    }
  },
  { urls: ["<all_urls>"] }
);

// Save URLs to Chrome storage
async function saveToStorage() {
  const urlArray = Array.from(jsUrls.values());
  
  // Keep only the last 1000 URLs to prevent storage overflow
  const limitedArray = urlArray.slice(-1000);
  
  await chrome.storage.local.set({ 
    jsUrls: limitedArray,
    lastUpdated: Date.now()
  });
}

// Load URLs from storage on startup
async function loadFromStorage() {
  const result = await chrome.storage.local.get(['jsUrls', 'isEnabled']);
  if (result.jsUrls) {
    jsUrls.clear();
    result.jsUrls.forEach(item => {
      jsUrls.set(item.url, item);
    });
  }
  // Load enabled state into memory
  isEnabled = result.isEnabled !== false;
  console.log('JS URL Collector loaded, enabled:', isEnabled);
}

// Load stored data on startup
loadFromStorage();

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getUrls':
      // Return current state (using in-memory variable for isEnabled)
      const urlArray = Array.from(jsUrls.values());
      sendResponse({ 
        urls: urlArray,
        isEnabled: isEnabled
      });
      return false; // Sync response
      
    case 'clearUrls':
      jsUrls.clear();
      chrome.storage.local.set({ jsUrls: [] });
      sendResponse({ success: true });
      return false;
      
    case 'toggleEnabled':
      // Toggle the enabled state
      isEnabled = !isEnabled;
      // Persist to storage
      chrome.storage.local.set({ isEnabled: isEnabled });
      console.log('JS URL Collector enabled:', isEnabled);
      sendResponse({ isEnabled: isEnabled });
      return false;
      
    case 'getEnabled':
      sendResponse({ isEnabled: isEnabled });
      return false;
  }
});
