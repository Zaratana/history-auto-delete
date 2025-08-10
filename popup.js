document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const indicator = document.getElementById('indicator');
  const toggleBtn = document.getElementById('toggleBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const confirmationDialog = document.getElementById('confirmationDialog');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // get current status
  function updateUI(enabled) {
    if (enabled) {
      statusText.textContent = 'Enabled';
      statusDiv.className = 'status enabled';
      indicator.className = 'indicator enabled';
      toggleBtn.textContent = 'Disable Auto-Delete';
      toggleBtn.className = 'toggle-btn disabled';
    } else {
      statusText.textContent = 'Disabled';
      statusDiv.className = 'status disabled';
      indicator.className = 'indicator disabled';
      toggleBtn.textContent = 'Enable Auto-Delete';
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
    toggleBtn.textContent = 'Processing...';

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
    confirmBtn.textContent = 'Deleting...';

    chrome.runtime.sendMessage({ action: 'deleteAll' }, (response) => {
      if (response && response.success) {
        confirmBtn.textContent = 'Deleted!';
        setTimeout(() => {
          hideConfirmationDialog();
        }, 1000);
      } else {
        confirmBtn.textContent = 'Error occurred';
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
    confirmBtn.textContent = 'Delete All';
  }
});
