let isEnabled = true;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log(chrome.i18n.getMessage('logInstalled'));

  // Load saved state
  chrome.storage.local.get(['enabled'], (result) => {
    isEnabled = result.enabled !== false; // Default to true
  });
});

chrome.history.onVisited.addListener((historyItem) => {
  if (!isEnabled) return;

  const url = historyItem.url;

  chrome.history.deleteUrl({ url: url }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.i18n.getMessage('errorDeleteFailed'), chrome.runtime.lastError);
    }
  });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ enabled: isEnabled });
  } else if (request.action === 'toggle') {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ enabled: isEnabled });

    sendResponse({ enabled: isEnabled });

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
        console.error(chrome.i18n.getMessage('errorDeleteAllFailed'), chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
      } else {
        console.log(chrome.i18n.getMessage('logDeletedAll'));
        sendResponse({ success: true });
      }
    });
    return true;
  }
});

// Set initial badge
chrome.action.setBadgeText({ text: 'ON' });
chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
