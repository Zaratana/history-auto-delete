let isEnabled = true;
let recentUrls = new Set();

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('History Auto-Delete extension installed');

  // Load saved state
  chrome.storage.local.get(['enabled'], (result) => {
    isEnabled = result.enabled !== false; // Default to true
  });
});

// Listen for history visits
chrome.history.onVisited.addListener((historyItem) => {
  if (!isEnabled) return;

  const url = historyItem.url;
  // Avoid deleting the same URL multiple times in quick succession
  if (recentUrls.has(url)) return;

  recentUrls.add(url);

  // Remove from recent URLs set after 1 second
  setTimeout(() => {
    recentUrls.delete(url);
  }, 1000);

  // Delete the history entry
  chrome.history.deleteUrl({ url: url }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to delete history entry:', chrome.runtime.lastError);
    } else {
      console.log('Deleted history entry:', url);
    }
  });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ enabled: isEnabled });
  } else if (request.action === 'toggle') {
    isEnabled = !isEnabled;

    // Save state
    chrome.storage.local.set({ enabled: isEnabled });

    sendResponse({ enabled: isEnabled });

    // Update badge
    chrome.action.setBadgeText({
      text: isEnabled ? 'ON' : 'OFF'
    });
    chrome.action.setBadgeBackgroundColor({
      color: isEnabled ? '#4CAF50' : '#F44336'
    });
  } else if (request.action === 'deleteAll') {
    // Delete all browsing history
    chrome.history.deleteAll(() => {
      if (chrome.runtime.lastError) {
        console.error('Failed to delete all history:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
      } else {
        console.log('Successfully deleted all browsing history');
        sendResponse({ success: true });
      }
    });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Set initial badge
chrome.action.setBadgeText({ text: 'ON' });
chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
