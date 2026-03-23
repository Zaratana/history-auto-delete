document.addEventListener('DOMContentLoaded', (): void => {
  const hostnameInput = document.getElementById('hostnameInput') as HTMLInputElement;
  const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
  const addError = document.getElementById('addError') as HTMLDivElement;
  const emptyState = document.getElementById('emptyState') as HTMLDivElement;
  const exemptionList = document.getElementById('exemptionList') as HTMLDivElement;
  const backBtn = document.getElementById('backBtn') as HTMLButtonElement;

  backBtn.addEventListener('click', (): void => {
    window.close();
  });

  function parseHostname(raw: string): string | null {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return null;
    const withScheme = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    try {
      const hostname = new URL(withScheme).hostname;
      if (!hostname || !hostname.includes('.') || hostname.includes(' ')) return null;
      return hostname;
    } catch {
      return null;
    }
  }

  function showError(msg: string): void {
    addError.textContent = msg;
  }

  function clearError(): void {
    addError.textContent = '';
  }

  function renderList(exemptions: ExemptedSite[]): void {
    exemptionList.innerHTML = '';

    if (exemptions.length === 0) {
      emptyState.style.display = 'block';
      exemptionList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    exemptionList.style.display = 'flex';

    exemptions.forEach((site: ExemptedSite): void => {
      const item = document.createElement('div');
      item.className = `exemption-item ${site.enabled ? 'active' : 'inactive'}`;
      item.dataset['hostname'] = site.hostname;

      // hostname label
      const label = document.createElement('span');
      label.className = 'exemption-hostname';
      label.textContent = site.hostname;

      // toggle switch
      const switchLabel = document.createElement('label');
      switchLabel.className = 'switch';
      switchLabel.title = site.enabled ? 'Exemption active — click to disable' : 'Exemption inactive — click to enable';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = site.enabled;
      checkbox.setAttribute('aria-label', `Toggle exemption for ${site.hostname}`);

      const track = document.createElement('span');
      track.className = 'switch-track';

      const thumb = document.createElement('span');
      thumb.className = 'switch-thumb';

      switchLabel.appendChild(checkbox);
      switchLabel.appendChild(track);
      switchLabel.appendChild(thumb);

      checkbox.addEventListener('change', (): void => {
        chrome.runtime.sendMessage<OutgoingMessage, MutateExemptionResponse>(
          { action: 'toggleExemption', hostname: site.hostname },
          (response: MutateExemptionResponse): void => {
            if (response?.success) {
              renderList(response.exemptions);
            }
          },
        );
      });

      // remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.title = `Remove ${site.hostname}`;
      removeBtn.setAttribute('aria-label', `Remove ${site.hostname}`);
      removeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>`;

      removeBtn.addEventListener('click', (): void => {
        chrome.runtime.sendMessage<OutgoingMessage, MutateExemptionResponse>(
          { action: 'removeExemption', hostname: site.hostname },
          (response: MutateExemptionResponse): void => {
            if (response?.success) {
              renderList(response.exemptions);
            }
          },
        );
      });

      item.appendChild(label);
      item.appendChild(switchLabel);
      item.appendChild(removeBtn);
      exemptionList.appendChild(item);
    });
  }


  chrome.runtime.sendMessage<OutgoingMessage, ExemptionsResponse>(
    { action: 'getExemptions' },
    (response: ExemptionsResponse): void => {
      renderList(response?.exemptions ?? []);
    },
  );


  function handleAdd(): void {
    clearError();
    const hostname = parseHostname(hostnameInput.value);

    if (!hostname) {
      showError('Please enter a valid hostname, e.g. gmail.com');
      hostnameInput.focus();
      return;
    }

    addBtn.disabled = true;

    chrome.runtime.sendMessage<OutgoingMessage, MutateExemptionResponse>(
      { action: 'addExemption', hostname },
      (response: MutateExemptionResponse): void => {
        addBtn.disabled = false;
        if (response?.success) {
          hostnameInput.value = '';
          renderList(response.exemptions);
        } else {
          showError('Failed to add site. Please try again.');
        }
      },
    );
  }

  addBtn.addEventListener('click', handleAdd);

  hostnameInput.addEventListener('keydown', (e: KeyboardEvent): void => {
    if (e.key === 'Enter') handleAdd();
  });
});
