// Header: search bar + settings button
export default function Header({ search, onSearch, onOpenSettings }) {
  return (
    <header className="header">
      <div className="header-top">
        <h1 className="title">Clipboard History</h1>

        <button
          type="button"
          className="icon-btn"
          title="Settings"
          aria-label="Settings"
          onClick={onOpenSettings}
        >

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >

            <circle cx="12" cy="12" r="3" />

            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>

        </button>
      </div>

      <div className="search-wrap">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >

          <circle cx="11" cy="11" r="8" />

          <path d="m21 21-4.3-4.3" />
        </svg>
        
        <input
          type="search"
          id="searchInput"
          placeholder="Search clipboard..."
          autoComplete="off"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </header>
  );
}
