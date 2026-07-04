// Shared utility: sends a message to the Chrome extension background service worker
const send = (type, payload = {}) =>
  new Promise((resolve) =>
    chrome.runtime.sendMessage({ type, ...payload }, resolve),
  );

export default send;
