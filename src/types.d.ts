// Message action types sent between popup and background service worker
type MessageAction = 'getStatus' | 'toggle' | 'deleteAll';

// Outgoing message shape from popup to background
interface OutgoingMessage {
  action: MessageAction;
}

// Response shapes from background to popup
interface StatusResponse {
  enabled: boolean;
}

interface DeleteAllResponse {
  success: boolean;
  error?: chrome.runtime.LastError;
}

type MessageResponse = StatusResponse | DeleteAllResponse;
