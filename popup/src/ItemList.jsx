import { useRef, useEffect } from "react";

const formatTime = (ts) => {
  const diff = Date.now() - ts;

  if (diff < 60000) {
    return "Just now";
  }

  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  }

  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  }

  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};


export default function ItemList({
  items,
  selected,
  onToggleSelect,
  onSelectAll,
  onDelete,
  onMove,
  onClearFolder,
  onCopy,
  onPin,
  onDeleteItem,
}) {
  const selectAllRef = useRef(null);

  const allSelected =
    items.length > 0 && items.every((i) => selected.has(i.id));

  const hasSelected = selected.size > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selected.size > 0 && !allSelected;
    }
  });

  return (
    <main className="main">
      <div className="toolbar">
        <label className="select-all">
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
          />

          <span>Select all</span>
        </label>
        <div className="toolbar-actions">
          <button
            type="button"
            className="btn ghost"
            disabled={!hasSelected}
            onClick={onMove}
          >
            Move
          </button>

          <button
            type="button"
            className="btn danger ghost"
            disabled={!hasSelected}
            onClick={onDelete}
          >
            Delete
          </button>

          <button type="button" className="btn ghost" onClick={onClearFolder}>
            Clear folder
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="item-list">
          {items.map((item) => {
            const isChecked = selected.has(item.id);

            const preview =
              item.text.length > 200
                ? item.text.slice(0, 200) + "…"
                : item.text;

            return (
              <li
                key={item.id}
                className={`item ${isChecked ? "selected" : ""}`}
                onClick={() => onCopy(item.text)}
              >
                <input
                  type="checkbox"
                  className="item-check"
                  checked={isChecked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleSelect(item.id)}
                />

                <div className="item-body">
                  <div className="item-text">{preview}</div>
                  <div className="item-meta">
                    <span>{formatTime(item.timestamp)}</span>

                    {item.source && <span>{item.source}</span>}

                    <span>{item.charCount ?? item.text.length} chars</span>
                  </div>
                </div>
                <div
                  className="item-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="icon-btn tiny"
                    title="Copy"
                    onClick={() => onCopy(item.text)}
                  >
                    ⎘
                  </button>

                  <button
                    className={`icon-btn tiny pin-item ${item.pinned ? "pin-badge" : ""}`}
                    title={item.pinned ? "Unpin" : "Pin"}
                    onClick={() => onPin(item)}
                  >
                    ★
                  </button>

                  <button
                    className="icon-btn tiny"
                    title="Delete"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No clipboard items yet.</p>
          
          <p className="hint">
            Copy text on any page to start building history.
          </p>
        </div>
      )}
    </main>
  );
}
