// Message action types sent between popup/settings and background service worker
type MessageAction =
  | 'getStatus'
  | 'toggle'
  | 'deleteAll'
  | 'getExemptions'
  | 'addExemption'
  | 'removeExemption'
  | 'toggleExemption';

// Outgoing message shape from popup/settings to background
interface OutgoingMessage {
  action: MessageAction;
  /** hostname to add, remove, or toggle — required for exemption actions */
  hostname?: string;
}

// Response shapes from background to popup/settings
interface StatusResponse {
  enabled: boolean;
}

interface DeleteAllResponse {
  success: boolean;
  error?: chrome.runtime.LastError;
}

/** A single entry in the exemption list */
interface ExemptedSite {
  /** The bare hostname, e.g. "gmail.com" */
  hostname: string;
  /** Whether the exemption is currently active (true = history kept) */
  enabled: boolean;
}

interface ExemptionsResponse {
  exemptions: ExemptedSite[];
}

interface MutateExemptionResponse {
  success: boolean;
  exemptions: ExemptedSite[];
}

type MessageResponse =
  | StatusResponse
  | DeleteAllResponse
  | ExemptionsResponse
  | MutateExemptionResponse;
