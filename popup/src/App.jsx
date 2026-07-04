import { useState, useEffect, useMemo, useRef } from "react";
import "../popup.css";
import send from "./send.js";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import ItemList from "./ItemList.jsx";
import { SettingsPanel, FolderModal, MoveModal, Toast } from "./Overlays.jsx";

export default function App() {
  // States
  const [items, setItems] = useState([]);

  const [folders, setFolders] = useState([]);

  const [settings, setSettings] = useState({
    maxItems: 200,
    deduplicate: true,
    theme: "dark",
  });

  const [folderId, setFolderId] = useState("inbox");

  const [selected, setSelected] = useState(new Set());

  const [search, setSearch] = useState("");

  // modal: null | "settings" | "folder" | "move"
  const [modal, setModal] = useState(null);

  const [editingFolder, setEditingFolder] = useState(null);

  const [toastMsg, setToastMsg] = useState(null);

  const toastTimer = useRef(null);


  const showToast = (msg) => {
    setToastMsg(msg);

    clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => setToastMsg(null), 2000);
  };

  const loadState = async () => {
    const res = await send("GET_STATE");

    if (res?.ok) {
      setItems(res.items ?? []);

      setFolders(res.folders ?? []);

      setSettings(
        res.settings ?? { maxItems: 200, deduplicate: true, theme: "dark" }
      );
    }
  };


  useEffect(() => {
    loadState();

    const listener = (changes, area) => {
      if (area === "local" && (changes.items || changes.folders)) loadState();
    };

    chrome.storage.onChanged.addListener(listener);

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);


  useEffect(() => {
    document.documentElement.dataset.theme =
      settings.theme === "light" ? "light" : "dark";
  }, [settings.theme]);


  const filteredItems = useMemo(() => {
    let list = items;
    
    if (folderId === "pinned") {
      list = list.filter((i) => i.pinned);
    }
    else if (folderId !== "all") {
      list = list.filter((i) => i.folderId === folderId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.text.toLowerCase().includes(q) ||
          i.source?.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) =>
      a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : b.timestamp - a.timestamp,
    );
  }, [items, folderId, search]);

  const folderCounts = useMemo(() => {
    const counts = { all: items.length, pinned: 0 };

    for (const item of items) {
      if (item.pinned) {
        counts.pinned++;
      }

      counts[item.folderId] = (counts[item.folderId] || 0) + 1;
    }

    return counts;
  }, [items]);

  // Keep selection valid when visible items change
  const visibleIds = new Set(filteredItems.map((i) => i.id));

  const activeSelected = new Set(
    [...selected].filter((id) => visibleIds.has(id)),
  );


  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);

      showToast("Copied to clipboard");
    } catch {
      showToast("Could not copy — try again");
    }
  };


  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);

      next.has(id) ? next.delete(id) : next.add(id);

      return next;
    });

  const handleSelectAll = (checked) =>
    setSelected(checked ? new Set(filteredItems.map((i) => i.id)) : new Set());

  const handleDeleteSelected = async () => {
    const res = await send("DELETE_ITEMS", { ids: [...activeSelected] });

    if (res.ok) {
      setItems(res.items);

      setSelected(new Set());

      showToast("Deleted selected items");
    }
  };

  const handleClearFolder = async () => {
    if (folderId === "all" || folderId === "pinned") {
      return showToast("Switch to a folder to clear it");
    }

    if (!confirm("Clear all items in this folder? (Pinned items are kept)")) {
      return;
    }

    const res = await send("CLEAR_FOLDER", { folderId });

    if (res.ok) {
      setItems(res.items);

      setSelected(new Set());

      showToast("Folder cleared");
    }
  };

  const handlePin = async (item) => {
    const res = await send("UPDATE_ITEM", {
      id: item.id,
      updates: { pinned: !item.pinned },
    });

    if (res.ok) {
      setItems(res.items);
    }
  };

  const handleDeleteItem = async (id) => {
    const res = await send("DELETE_ITEMS", { ids: [id] });

    if (res.ok) {
      setItems(res.items);

      setSelected((prev) => {
        const next = new Set(prev);

        next.delete(id);

        return next;
      });

      showToast("Item deleted");
    }
  };


  const handleSaveFolder = async ({ id, name, color }) => {
    if (id) {
      const res = await send("RENAME_FOLDER", { id, name });

      if (res.ok) {
        setFolders(res.folders);

        setModal(null);
      }
    } 
    else {
      const res = await send("CREATE_FOLDER", { name, color });

      if (res.ok) {
        setFolders((prev) => [...prev, res.folder]);

        setModal(null);

        showToast("Folder created");
      }
      else{
        showToast(res.error)
      }
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!confirm("Delete this folder? Items will move to Inbox.")) {
      return;
    }

    const res = await send("DELETE_FOLDER", { id });

    if (res.ok) {
      setFolders(res.folders);

      setItems(res.items);

      if (folderId === id) {
        setFolderId("inbox");
      }

      showToast("Folder deleted");
    }
  };

  const handleMoveSelected = async (targetFolderId) => {
    const res = await send("MOVE_ITEMS", {
      ids: [...activeSelected],

      folderId: targetFolderId,
    });

    if (res.ok) {
      setItems(res.items);

      setSelected(new Set());

      setModal(null);

      showToast("Moved to folder");
    }
  };


  const updateSetting = async (key, val) => {
    const next = { ...settings, [key]: val };

    setSettings(next);

    await send("SAVE_SETTINGS", { settings: next });
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all history except pinned items?")) {
      return;
    }

    const res = await send("CLEAR_ALL");

    if (res.ok) {
      setItems(res.items);

      setSelected(new Set());

      showToast("History cleared");
    }
  };


  return (
    <>
      <Header
        search={search}

        onSearch={setSearch}

        onOpenSettings={() => setModal("settings")}
      />

      <div className="layout">
        <Sidebar
          folders={folders}

          folderId={folderId}

          folderCounts={folderCounts}

          onSelectFolder={(id) => {
            setFolderId(id);
            setSelected(new Set());
          }}

          onNewFolder={() => {
            setEditingFolder(null);
            setModal("folder");
          }}

          onRenameFolder={(f) => {
            setEditingFolder(f);
            setModal("folder");
          }}

          onDeleteFolder={handleDeleteFolder}
        />

        <ItemList
          items={filteredItems}

          selected={activeSelected}

          onToggleSelect={toggleSelect}

          onSelectAll={handleSelectAll}

          onDelete={handleDeleteSelected}

          onMove={() => setModal("move")}

          onClearFolder={handleClearFolder}

          onCopy={copyText}

          onPin={handlePin}

          onDeleteItem={handleDeleteItem}
        />
      </div>

      <SettingsPanel
        open={modal === "settings"}

        settings={settings}

        onClose={() => setModal(null)}

        onUpdate={updateSetting}

        onClearAll={handleClearAll}
      />

      <FolderModal
        open={modal === "folder"}

        folder={editingFolder}

        onClose={() => setModal(null)}

        onSave={handleSaveFolder}
      />

      <MoveModal
        open={modal === "move"}

        folders={folders}

        onClose={() => setModal(null)}
        
        onMove={handleMoveSelected}
      />

      <Toast message={toastMsg} />
    </>
  );
}
