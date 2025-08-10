# History Auto-Delete Chrome Extension

A Chrome extension that automatically deletes new browsing history entries in real-time, helping you maintain privacy while browsing.

## Features
- **Automatic History Deletion**: Instantly removes new history entries as you browse
- **Toggle Control**: Easy enable/disable functionality via popup interface
- **Delete All History**: One-click button to clear entire browsing history
- **Dark Mode UI**: Sleek dark theme interface
- **Multi-Language Support**: Available in English, French, and Spanish
- **Visual Status Indicators**: Clear ON/OFF badge and status display

## What It Does
This extension listens for new entries being added to your Chrome browsing history and immediately deletes them. When enabled, no websites you visit will be saved to your browser history. It's perfect for:

- Privacy-conscious browsing
- Shared computers
- Temporary browsing sessions
- Preventing history accumulation

> [!NOTE]  
> This extension has only been tested on Chrome `v138.0.7204.184 (Official Build) (arm64)` as of August 2025. Thus it might break or not work properly on older other versions of Chrome or other browsers.

## Installation for Development
### Prerequisites
- Google Chrome browser
- Basic understanding of Chrome extensions

### Steps to Load Locally
1. **Download/Clone the Extension Files**
   ```
   history-auto-delete/
   ├── manifest.json
   ├── background.js
   ├── popup.html
   ├── popup.js
   ├── icons/
       ├── icon16.png
       ├── icon32.png
       ├── icon48.png
       └── icon128.png
   └── _locales/
       ├── en/messages.json
       ├── fr/messages.json
       └── es/messages.json
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or go to Chrome menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing your extension files
   - The extension should appear in your extensions list

5. **Verify Installation**
   - Look for the extension icon in your Chrome toolbar
   - Click the icon to open the popup interface
   - The badge should show "ON" by default

### Testing the Extension

1. **Test Auto-Deletion**:
   - Ensure the extension is enabled (ON badge visible)
   - Visit any website
   - Check your browser history (`Ctrl+H`) - the site should not appear

2. **Test Toggle Functionality**:
   - Click the extension icon
   - Click "Disable Auto-Delete"
   - Visit a website - it should now appear in history
   - Re-enable the extension

3. **Test Delete All**:
   - Build up some history with the extension disabled
   - Click "Delete All History" in the popup
   - Confirm the deletion - all history should be cleared

## File Structure

```
├── manifest.json         # Extension configuration (Manifest V3)
├── background.js         # Service worker handling history deletion
├── popup.html            # User interface HTML
├── popup.js              # Popup functionality and UI logic
└── _locales/             # Internationalization files
    ├── en/messages.json  # English translations
    ├── fr/messages.json  # French translations
    └── es/messages.json  # Spanish translations
```

## Development Notes
### Permissions Used
- `history`: Required to read and delete browsing history
- `storage`: Used to persist extension enable/disable state

### Key APIs
- `chrome.history.onVisited`: Listens for new history entries
- `chrome.history.deleteUrl()`: Removes specific history entries
- `chrome.history.deleteAll()`: Clears entire browsing history
- `chrome.i18n`: Handles internationalization

### Debugging
- Open `chrome://extensions/`
- Click "Inspect views: service worker" to debug background script
- Right-click extension popup → "Inspect" to debug popup

## Customization
### Adding New Languages
1. Create a new folder in `_locales/` (e.g., `de` for German)
2. Copy `en/messages.json` to the new folder
3. Translate all message values
4. The extension will automatically detect supported languages

### Styling Changes
- Modify CSS in `popup.html` `<style>` section
- Current theme uses dark mode with blue accents

## Troubleshooting

**Extension not loading:**
- Ensure all required files are present
- Check for JSON syntax errors in manifest.json
- Verify file permissions

**Auto-deletion not working:**
- Check that extension has history permissions
- Ensure extension is enabled (ON badge)
- Look for errors in browser console

**Popup not displaying correctly:**
- Check browser console for JavaScript errors
- Verify all message keys exist in locale files

## Privacy & Security
- This extension only operates locally on your browser
- No data is sent to external servers
- History deletion is permanent and cannot be undone
- Use with caution as deleted history cannot be recovered

## License
This project is open source and available for educational and personal use under the MIT license.