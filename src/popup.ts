document.addEventListener('DOMContentLoaded', (): void => {
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  const statusText = document.getElementById('statusText') as HTMLSpanElement;
  const indicator = document.getElementById('indicator') as HTMLDivElement;
  const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement;
  const deleteAllBtn = document.getElementById('deleteAllBtn') as HTMLButtonElement;
  const confirmationDialog = document.getElementById('confirmationDialog') as HTMLDivElement;
  const confirmBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
  const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
  const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;

  // initialize internationalization
  function initializeI18n(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
    elements.forEach((element: HTMLElement): void => {
      const messageKey = element.getAttribute('data-i18n');
      if (!messageKey) return;
      const message = chrome.i18n.getMessage(messageKey);
      if (message) {
        element.textContent = message;
      }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el: HTMLElement): void => {
      const key = el.getAttribute('data-i18n-title');
      if (key) { const msg = chrome.i18n.getMessage(key); if (msg) el.title = msg; }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el: HTMLElement): void => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) { const msg = chrome.i18n.getMessage(key); if (msg) el.setAttribute('aria-label', msg); }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el: HTMLElement): void => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) { const msg = chrome.i18n.getMessage(key); if (msg) (el as HTMLInputElement).placeholder = msg; }
    });
  }

  // initialize internationalization
  initializeI18n();

  // get current status
  function updateUI(enabled: boolean): void {
    if (enabled) {
      statusText.textContent = chrome.i18n.getMessage('statusEnabled');
      statusDiv.className = 'status enabled';
      indicator.className = 'indicator enabled';
      toggleBtn.textContent = chrome.i18n.getMessage('buttonDisable');
      toggleBtn.className = 'toggle-btn disabled';
    } else {
      statusText.textContent = chrome.i18n.getMessage('statusDisabled');
      statusDiv.className = 'status disabled';
      indicator.className = 'indicator disabled';
      toggleBtn.textContent = chrome.i18n.getMessage('buttonEnable');
      toggleBtn.className = 'toggle-btn';
    }
  }

  // load initial status
  chrome.runtime.sendMessage<OutgoingMessage, StatusResponse>(
    { action: 'getStatus' },
    (response: StatusResponse): void => {
      if (response) {
        updateUI(response.enabled);
      }
    },
  );

  // handle toggle button click
  toggleBtn.addEventListener('click', (): void => {
    toggleBtn.disabled = true;
    toggleBtn.textContent = chrome.i18n.getMessage('buttonProcessing');

    chrome.runtime.sendMessage<OutgoingMessage, StatusResponse>(
      { action: 'toggle' },
      (response: StatusResponse): void => {
        if (response) {
          updateUI(response.enabled);
        }
        toggleBtn.disabled = false;
      },
    );
  });

  // handle delete all button click
  deleteAllBtn.addEventListener('click', (): void => {
    confirmationDialog.classList.add('show');
    deleteAllBtn.style.display = 'none';
  });

  // handle confirmation dialog
  confirmBtn.addEventListener('click', (): void => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDeleting');

    chrome.runtime.sendMessage<OutgoingMessage, DeleteAllResponse>(
      { action: 'deleteAll' },
      (response: DeleteAllResponse): void => {
        if (response && response.success) {
          confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDeleted');
          setTimeout((): void => {
            hideConfirmationDialog();
          }, 1000);
        } else {
          confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonError');
          confirmBtn.disabled = false;
          setTimeout((): void => {
            hideConfirmationDialog();
          }, 2000);
        }
      },
    );
  });

  cancelBtn.addEventListener('click', (): void => {
    hideConfirmationDialog();
  });

  function hideConfirmationDialog(): void {
    confirmationDialog.classList.remove('show');
    deleteAllBtn.style.display = 'block';
    confirmBtn.disabled = false;
    confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDelete');
  }

  // open settings page in a new extension tab
  settingsBtn.addEventListener('click', (): void => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });
});
