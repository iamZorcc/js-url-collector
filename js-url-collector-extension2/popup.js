// JS URL Collector - Popup Script

// State
let allUrls = [];
let filteredUrls = [];
let isEnabled = true;

// DOM Elements
const enableToggle = document.getElementById('enableToggle');
const toggleLabel = document.getElementById('toggleLabel');
const domainFilter = document.getElementById('domainFilter');
const filterBtn = document.getElementById('filterBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const clearBtn = document.getElementById('clearBtn');
const refreshBtn = document.getElementById('refreshBtn');
const urlList = document.getElementById('urlList');
const totalCount = document.getElementById('totalCount');
const filteredCount = document.getElementById('filteredCount');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadUrls();
  await checkEnabled();
  renderUrls();
});

// Check if extension is enabled
async function checkEnabled() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getEnabled' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting enabled state:', chrome.runtime.lastError);
        isEnabled = true;
      } else {
        isEnabled = response.isEnabled;
      }
      updateToggleUI();
      resolve();
    });
  });
}

// Update toggle UI
function updateToggleUI() {
  enableToggle.checked = isEnabled;
  toggleLabel.textContent = isEnabled ? 'Enabled' : 'Disabled';
  toggleLabel.style.color = isEnabled ? 'var(--primary)' : 'var(--text-muted)';
}

// Load URLs from background
async function loadUrls() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getUrls' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading URLs:', chrome.runtime.lastError);
        allUrls = [];
      } else {
        allUrls = response.urls || [];
        isEnabled = response.isEnabled !== false;
      }
      filteredUrls = [...allUrls];
      updateStats();
      resolve();
    });
  });
}

// Update statistics
function updateStats() {
  totalCount.textContent = allUrls.length;
  filteredCount.textContent = filteredUrls.length;
}

// Filter URLs by domain
function filterUrls() {
  const filterValue = domainFilter.value.trim().toLowerCase();
  
  if (!filterValue) {
    filteredUrls = [...allUrls];
  } else {
    filteredUrls = allUrls.filter(item => {
      return item.domain.toLowerCase().includes(filterValue);
    });
  }
  
  updateStats();
  renderUrls();
}

// Render URL list
function renderUrls() {
  if (filteredUrls.length === 0) {
    urlList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <p>${allUrls.length === 0 ? 'No JavaScript URLs collected yet.' : 'No URLs match your filter.'}</p>
        <p class="hint">${allUrls.length === 0 ? 'Browse websites to collect JS URLs' : 'Try a different domain filter'}</p>
      </div>
    `;
    return;
  }
  
  // Sort by timestamp (newest first)
  const sortedUrls = [...filteredUrls].sort((a, b) => b.timestamp - a.timestamp);
  
  urlList.innerHTML = sortedUrls.map(item => `
    <div class="url-item" data-url="${escapeHtml(item.url)}">
      <div class="url-domain">${escapeHtml(item.domain)}</div>
      <div class="url-text">${escapeHtml(item.url)}</div>
      <div class="url-time">${formatTime(item.timestamp)}</div>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.url-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      copyToClipboard(url);
      showToast('URL copied to clipboard!');
    });
  });
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Copy all filtered URLs
async function copyAllFiltered() {
  if (filteredUrls.length === 0) {
    showToast('No URLs to copy!');
    return;
  }
  
  const urlText = filteredUrls.map(item => item.url).join('\n');
  await copyToClipboard(urlText);
  showToast(`${filteredUrls.length} URLs copied to clipboard!`);
}

// Clear all URLs
async function clearAllUrls() {
  if (!confirm('Are you sure you want to clear all collected URLs?')) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'clearUrls' }, (response) => {
    if (response.success) {
      allUrls = [];
      filteredUrls = [];
      updateStats();
      renderUrls();
      showToast('All URLs cleared!');
    }
  });
}

// Toggle extension enabled state
function toggleEnabled() {
  chrome.runtime.sendMessage({ action: 'toggleEnabled' }, (response) => {
    isEnabled = response.isEnabled;
    updateToggleUI();
    showToast(isEnabled ? 'Collection enabled!' : 'Collection disabled!');
  });
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Event Listeners
enableToggle.addEventListener('change', toggleEnabled);

filterBtn.addEventListener('click', filterUrls);

domainFilter.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    filterUrls();
  }
});

copyAllBtn.addEventListener('click', copyAllFiltered);

clearBtn.addEventListener('click', clearAllUrls);

refreshBtn.addEventListener('click', async () => {
  await loadUrls();
  filterUrls();
  showToast('URLs refreshed!');
});

// Real-time filter as user types (debounced)
let filterTimeout;
domainFilter.addEventListener('input', () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(filterUrls, 300);
});
