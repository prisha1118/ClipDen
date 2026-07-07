# ClipDen

A Chrome/Edge browser extension built with React and Vite that keeps a searchable history of everything you copy, with folders to organize clips and tools to delete or bulk-manage them.

## Features

- **Automatic capture** — Copy or cut text on any webpage; entries are saved automatically
- **History browser** — Open the popup to browse, search, and re-copy past clips
- **Folders** — Default Inbox and Pinned views, plus custom folders with colors
- **Delete selectively** — Remove single items, selected items, or clear an entire folder
- **Pin important clips** — Pinned items survive “clear all” and folder clears
- **Settings** — Max history size, deduplication toggle, and dark/light theme

## Install (Developer Mode)

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project using Vite:
   ```bash
   npm run build
   ```
4. Open Chrome or Edge and go to `chrome://extensions` (or `edge://extensions`).
5. Enable **Developer mode** (typically a toggle in the top-right corner).
6. Click **Load unpacked** and select the **`dist`** folder generated in the root of this project.
7. Pin the extension icon for quick access.

## Usage

| Action | How |
|--------|-----|
| View history | Click the extension icon |
| Copy again | Click an item, or use the copy button on hover |
| Delete one | Click × on the item |
| Delete many | Check items → **Delete** |
| Move to folder | Select items → **Move** |
| New folder | Click **+** in the sidebar |
| Pin | Click ★ on an item |
| Clear folder | Select a folder → **Clear folder** |
| Clear everything | Settings → **Clear all (keep pinned)** |


## Privacy

All clipboard data stays in **local browser storage** (`chrome.storage.local`). Nothing is sent to any server.

## Limitations

- Captures **plain text** only (not images or rich formatting)
- Some pages with strict Content Security Policies (CSP) may limit clipboard access
- Browser security requires a user gesture for some clipboard reads; copy/cut events are the primary capture path

