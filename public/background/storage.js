const DEFAULTS = {
  maxItems: 200,
  deduplicate: true,
  theme: "dark",
};

const SYSTEM_FOLDERS = [
  { id: "inbox", name: "Inbox", color: "#6366f1", system: true },
  { id: "pinned", name: "Pinned", color: "#f59e0b", system: true },
];

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const sortItems = (items) =>
  [...items].sort((a, b) =>
    a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : b.timestamp - a.timestamp,
  );

export async function getState() {
  const data = await chrome.storage.local.get(["items", "folders", "settings"]);

  return {
    items: data.items ?? [],
    folders: data.folders ?? SYSTEM_FOLDERS,
    settings: { ...DEFAULTS, ...data.settings },
  };
}

export async function saveState(partial) {
  await chrome.storage.local.set(partial);
}

export async function addItem(text, meta = {}) {
  const trimmed = text?.trim();

  if (!trimmed) {
    return null;
  }

  const { settings, items, folders } = await getState();

  const folderId = folders.some((f) => f.id === (meta.folderId ?? "inbox"))
    ? (meta.folderId ?? "inbox")
    : "inbox";

  if (settings.deduplicate) {
    const existing = items.find(
      (item) => item.text === trimmed && item.folderId === folderId,
    );

    if (existing) {
      existing.timestamp = Date.now();

      existing.source = meta.source ?? existing.source;

      await saveState({ items: sortItems(items) });

      return existing;
    }
  }

  items.unshift({
    id: id(),
    text: trimmed,
    timestamp: Date.now(),
    folderId,
    pinned: false,
    source: meta.source ?? "",
    charCount: trimmed.length,
  });

  const max = settings.maxItems;

  const pinned = items.filter((i) => i.pinned);

  const next =
    items.length > max
      ? [
          ...pinned,
          ...items.filter((i) => !i.pinned).slice(0, max - pinned.length),
        ]
      : items;

  await saveState({ items: next });

  return items[0];
}

export async function deleteItems(ids) {
  const set = new Set(ids);

  const { items } = await getState();

  const next = items.filter((item) => !set.has(item.id));
  
  await saveState({ items: next });

  return next;
}

export async function updateItem(itemId, updates) {
  const { items } = await getState();

  const next = sortItems(
    items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
  );

  await saveState({ items: next });

  return next;
}

export async function moveItems(ids, folderId) {
  const set = new Set(ids);

  const { items } = await getState();
  
  const next = sortItems(
    items.map((item) => (set.has(item.id) ? { ...item, folderId } : item)),
  );

  await saveState({ items: next });

  return next;
}

export async function createFolder(name, color = "#6366f1") {
  const { folders } = await getState();

  const found = folders.find((f) => f.name.toLowerCase() === name.trim().toLowerCase())

  if (found) {
    throw new Error("Folder with this name already exists");
  }

  const folder = {
      id: id(),
      name: name.trim(),
      color,
      system: false,
      createdAt: Date.now(),
  };

  await saveState({ folders: [...folders, folder] });

  return folder;
}

export async function renameFolder(folderId, name) {
  const { folders } = await getState();

  const next = folders.map((f) =>
    f.id === folderId && !f.system ? { ...f, name: name.trim() } : f,
  );

  await saveState({ folders: next });

  return next;
}

export async function deleteFolder(folderId) {
  const { folders, items } = await getState();

  const folder = folders.find((f) => f.id === folderId);

  if (!folder || folder.system) {
    return { folders, items };
  }

  const nextFolders = folders.filter((f) => f.id !== folderId);

  const nextItems = items.map((item) =>
    item.folderId === folderId ? { ...item, folderId: "inbox" } : item,
  );

  await saveState({ folders: nextFolders, items: nextItems });

  return { 
    folders: nextFolders, 
    items: nextItems 
  };
}

export async function clearFolder(folderId) {
  const { items } = await getState();

  const next = items.filter(
    (item) => item.folderId !== folderId || item.pinned,
  );

  await saveState({ items: next });

  return next;
}

export async function clearAllExceptPinned() {
  const { items } = await getState();

  const next = items.filter((item) => item.pinned);

  await saveState({ items: next });
  
  return next;
}
