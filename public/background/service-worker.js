import {
  addItem,
  getState,
  deleteItems,
  updateItem,
  moveItems,
  createFolder,
  renameFolder,
  deleteFolder,
  clearFolder,
  clearAllExceptPinned,
  saveState,
} from "./storage.js";

const handlers = {
  CLIPBOARD_CAPTURED: async (m) => {
    await addItem(m.text, { source: m.source });
  },

  GET_STATE: () => getState(),

  DELETE_ITEMS: async (m) => ({ items: await deleteItems(m.ids) }),

  UPDATE_ITEM: async (m) => ({ items: await updateItem(m.id, m.updates) }),

  MOVE_ITEMS: async (m) => ({ items: await moveItems(m.ids, m.folderId) }),

  CREATE_FOLDER: async (m) => ({ folder: await createFolder(m.name, m.color) }),

  RENAME_FOLDER: async (m) => ({ folders: await renameFolder(m.id, m.name) }),

  DELETE_FOLDER: (m) => deleteFolder(m.id),

  CLEAR_FOLDER: async (m) => ({ items: await clearFolder(m.folderId) }),

  CLEAR_ALL: async (m) => ({ items: await clearAllExceptPinned() }),

  SAVE_SETTINGS: (m) => saveState({ settings: m.settings }),
};

chrome.runtime.onInstalled.addListener(async () => {
  for (const tab of await chrome.tabs.query({})) {
    if (!tab.id || !/^https?:\/\//.test(tab.url ?? "")) {
      continue;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ["content/content.js"],
      });
    } catch {
      /* restricted pages */
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handler = handlers[message.type];

  if (!handler) {
    sendResponse({ ok: false, error: "Unknown message type" });
    return true;
  }

  Promise.resolve(handler(message))
    .then((result) =>
      sendResponse({
        ok: true,
        ...(result && typeof result === "object" ? result : {}),
      }),
    )
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true;
});
