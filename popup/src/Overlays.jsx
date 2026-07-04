// Settings panel, FolderModal, MoveModal, and Toast — all overlay UI
import { useState, useEffect } from "react";

export function SettingsPanel({
  open,
  settings,
  onClose,
  onUpdate,
  onClearAll,
}) {
  return (
    <div className={`panel ${open ? "" : "hidden"}`}>
      <div className="panel-header">
        <h2>Settings</h2>

        <button
          type="button"
          className="icon-btn"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <label className="field">
        <span>Max history items</span>

        <input
          type="number"
          min="10"
          max="1000"
          step="10"
          value={settings.maxItems}
          onChange={(e) =>
            onUpdate("maxItems", parseInt(e.target.value, 10) || 200)
          }
        />
      </label>
      <label className="field checkbox-field">
        <input
          type="checkbox"
          checked={settings.deduplicate}
          onChange={(e) => onUpdate("deduplicate", e.target.checked)}
        />

        <span>Deduplicate identical copies</span>
      </label>
      <label className="field">
        <span>Theme</span>

        <select
          value={settings.theme}
          onChange={(e) => onUpdate("theme", e.target.value)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>

      <button type="button" className="btn danger full" onClick={onClearAll}>
        Clear all (keep pinned)
      </button>
    </div>
  );
}

// Folder Create / Rename Modal
export function FolderModal({ open, folder, onClose, onSave }) {
  // folder is null for new, or { id, name, color } for rename

  const [name, setName] = useState(folder?.name ?? "");

  const [color, setColor] = useState(folder?.color ?? "#6366f1");

  useEffect(() => {
    if (open) {
      setName(folder?.name ?? "");
      setColor(folder?.color ?? "#6366f1");
    }
  }, [open, folder]);

  // Reset when the modal opens for a different folder
  if (!open) {
    return null;
  }

  const handleSave = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    onSave({ id: folder?.id ?? null, name: trimmed, color });
  };

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <h2>{folder ? "Rename folder" : "New folder"}</h2>

        <label className="field">
          <span>Name</span>

          <input
            type="text"
            maxLength="40"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Color</span>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button type="button" className="btn primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Move to Folder Modal
export function MoveModal({ open, folders, onClose, onMove }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <h2>Move to folder</h2>

        <ul className="move-folder-list">
          {folders
            .filter((f) => f.id !== "pinned")
            .map((f) => (
              <li key={f.id} onClick={() => onMove(f.id)}>
                <span className="folder-dot" style={{ background: f.color }} />
                {f.name}
              </li>
            ))}
        </ul>
        
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export function Toast({ message }) {
  if (!message) {
    return null;
  }

  return <div className="toast">{message}</div>;
}
