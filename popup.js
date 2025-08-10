document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const indicator = document.getElementById('indicator');
  const toggleBtn = document.getElementById('toggleBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const confirmationDialog = document.getElementById('confirmationDialog');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // initialize internationalization
  function initializeI18n() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const messageKey = element.getAttribute('data-i18n');
      const message = chrome.i18n.getMessage(messageKey);
      if (message) {
        element.textContent = message;
      }
    });
  }

  // initialize internationalization
  initializeI18n();

  // get current status
  function updateUI(enabled) {
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
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response) {
      updateUI(response.enabled);
    }
  });

  // handle toggle button click
  toggleBtn.addEventListener('click', () => {
    toggleBtn.disabled = true;
    toggleBtn.textContent = chrome.i18n.getMessage('buttonProcessing');

    chrome.runtime.sendMessage({ action: 'toggle' }, (response) => {
      if (response) {
        updateUI(response.enabled);
      }
      toggleBtn.disabled = false;
    });
  });

  // handle delete all button click
  deleteAllBtn.addEventListener('click', () => {
    confirmationDialog.classList.add('show');
    deleteAllBtn.style.display = 'none';
  });

  // handle confirmation dialog
  confirmBtn.addEventListener('click', () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDeleting');

    chrome.runtime.sendMessage({ action: 'deleteAll' }, (response) => {
      if (response && response.success) {
        confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDeleted');
        setTimeout(() => {
          hideConfirmationDialog();
        }, 1000);
      } else {
        confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonError');
        confirmBtn.disabled = false;
        setTimeout(() => {
          hideConfirmationDialog();
        }, 2000);
      }
    });
  });

  cancelBtn.addEventListener('click', () => {
    hideConfirmationDialog();
  });

  function hideConfirmationDialog() {
    confirmationDialog.classList.remove('show');
    deleteAllBtn.style.display = 'block';
    confirmBtn.disabled = false;
    confirmBtn.textContent = chrome.i18n.getMessage('confirmButtonDelete');
  }
});
