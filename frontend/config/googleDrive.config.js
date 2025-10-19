/**
 * Google Drive API Configuration
 * Store your API credentials here
 * Get these from: https://console.cloud.google.com/
 */

const GOOGLE_DRIVE_CONFIG = {
  // Google Cloud Project Client ID
  CLIENT_ID:
    "532045151451-09l98b9guf3olt8i1mfnlaa50e251oj5.apps.googleusercontent.com",

  // Google Drive API Key
  API_KEY: "AIzaSyCEJUomFCZex4ubN9_sBDDXstiHNBadxME",

  // OAuth 2.0 Scopes
  SCOPES: ["https://www.googleapis.com/auth/drive.file"],

  // Discovery Document URL for Google Drive API
  DISCOVERY_DOCS: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  ],
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = GOOGLE_DRIVE_CONFIG;
}
