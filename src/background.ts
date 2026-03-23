let isEnabled: boolean = true;
let exemptions: ExemptedSite[] = [];


/** Return true when the given URL is covered by an active exemption. */
function isExempted(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return exemptions.some(
      (site: ExemptedSite) => site.enabled && site.hostname === hostname,
    );
  } catch {
    return false;
  }
}

/** Persist the current exemptions array to storage. */
function saveExemptions(): void {
  chrome.storage.local.set({ exemptions });
}

function updateBadge(): void {
  chrome.action.setBadgeText({ text: isEnabled ? 'on' : 'off' });
  chrome.action.setBadgeBackgroundColor({
    color: isEnabled ? '#4CAF50' : '#F44336',
  });
}

chrome.runtime.onInstalled.addListener((): void => {
  console.log(chrome.i18n.getMessage('logInstalled'));

  chrome.storage.local.get(
    ['enabled', 'exemptions'],
    (result: { enabled?: boolean; exemptions?: ExemptedSite[] }): void => {
      isEnabled = result.enabled !== false; // default true
      exemptions = Array.isArray(result.exemptions) ? result.exemptions : [];
    },
  );
});

// Restore state on service-worker startup (after browser restart, etc.)
chrome.storage.local.get(
  ['enabled', 'exemptions'],
  (result: { enabled?: boolean; exemptions?: ExemptedSite[] }): void => {
    isEnabled = result.enabled !== false;
    exemptions = Array.isArray(result.exemptions) ? result.exemptions : [];
  },
);

chrome.history.onVisited.addListener((historyItem: chrome.history.HistoryItem): void => {
  if (!isEnabled) return;

  const url = historyItem.url;
  if (!url) return;

  // Skip deletion when the URL matches an active exemption
  if (isExempted(url)) return;

  chrome.history.deleteUrl({ url }, (): void => {
    if (chrome.runtime.lastError) {
      console.error(chrome.i18n.getMessage('errorDeleteFailed'), chrome.runtime.lastError);
    }
  });
});


chrome.runtime.onMessage.addListener(
  (
    request: OutgoingMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: StatusResponse | DeleteAllResponse | ExemptionsResponse | MutateExemptionResponse) => void,
  ): boolean | undefined => {
    if (request.action === 'getStatus') {
      sendResponse({ enabled: isEnabled });

    } else if (request.action === 'toggle') {
      isEnabled = !isEnabled;
      chrome.storage.local.set({ enabled: isEnabled });
      updateBadge();
      sendResponse({ enabled: isEnabled });

    } else if (request.action === 'deleteAll') {
      chrome.history.deleteAll((): void => {
        if (chrome.runtime.lastError) {
          console.error(
            chrome.i18n.getMessage('errorDeleteAllFailed'),
            chrome.runtime.lastError,
          );
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          console.log(chrome.i18n.getMessage('logDeletedAll'));
          sendResponse({ success: true });
        }
      });
      return true; // async response

    } else if (request.action === 'getExemptions') {
      sendResponse({ exemptions });

    } else if (request.action === 'addExemption') {
      const hostname = request.hostname?.trim().toLowerCase();
      if (hostname && !exemptions.some((s: ExemptedSite) => s.hostname === hostname)) {
        exemptions.push({ hostname, enabled: true });
        saveExemptions();
      }
      sendResponse({ success: true, exemptions });

    } else if (request.action === 'removeExemption') {
      const hostname = request.hostname?.trim().toLowerCase();
      exemptions = exemptions.filter((s: ExemptedSite) => s.hostname !== hostname);
      saveExemptions();
      sendResponse({ success: true, exemptions });
    } else if (request.action === 'toggleExemption') {
      const hostname = request.hostname?.trim().toLowerCase();
      const site = exemptions.find((s: ExemptedSite) => s.hostname === hostname);
      if (site) {
        site.enabled = !site.enabled;
        saveExemptions();
      }
      sendResponse({ success: true, exemptions });
    }

    return undefined;
  },
);

updateBadge();
