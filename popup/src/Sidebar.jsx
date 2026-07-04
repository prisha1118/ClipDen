const ALL_FOLDER = {
  id: "all",
  name: "All items",
  color: "#8b92a5",
  system: true,
};

export default function Sidebar({
  folders,
  folderId,
  folderCounts,
  onSelectFolder,
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-label">Folders</span>

        <button
          type="button"
          className="icon-btn small"
          title="New folder"
          aria-label="New folder"
          onClick={onNewFolder}
        >
          +
        </button>
      </div>

      <ul className="folder-list">
        {[ALL_FOLDER, ...folders].map((f) => (
          <li
            key={f.id}
            className={`folder-item ${folderId === f.id ? "active" : ""}`}
            onClick={() => onSelectFolder(f.id)}
          >
            <span className="folder-dot" style={{ background: f.color }} />

            <span className="folder-name">{f.name}</span>

            <span className="folder-count">{folderCounts[f.id] ?? 0}</span>

            {!f.system && f.id !== "pinned" && (
              <span className="folder-actions">

                <button
                  className="icon-btn tiny"
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(f);
                  }}
                >
                  ✎
                </button>
                
                <button
                  className="icon-btn tiny"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(f.id);
                  }}
                >
                  ×
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
