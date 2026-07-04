(function () {
  if (window.__clipboardHistoryLoaded) {
    return;
  }

  window.__clipboardHistoryLoaded = true;

  let last = { text: "", at: 0 };

  const send = (text) => {
    const trimmed = text?.trim();

    if (!trimmed){
      return;
    }

    const now = Date.now();

    if (trimmed === last.text && now - last.at < 800) {
      return;
    }

    last = { text: trimmed, at: now };
    
    chrome.runtime
      .sendMessage({
        type: "CLIPBOARD_CAPTURED",
        text: trimmed,
        source: location.hostname || "local",
      })
      .catch(() => {});
  };

  const fromSelection = () => {
    const selected = window.getSelection()?.toString()?.trim();

    if (selected) {
      return selected;
    }

    const el = document.activeElement;

    if (el?.tagName !== "INPUT" && el?.tagName !== "TEXTAREA") {
      return null;
    }

    const { selectionStart: start, selectionEnd: end } = el;

    return start != null && end != null && start !== end
      ? el.value.slice(start, end).trim()
      : null;
  };

  const fromEvent = (event) => {
    const data = event?.clipboardData;

    if (!data) {
      return null;
    }

    const plain = data.getData("text/plain")?.trim();

    if (plain) {
      return plain;
    }

    const html = data.getData("text/html");

    if (!html) {
      return null;
    }

    const node = document.createElement("div");

    node.innerHTML = html;

    return node.textContent?.trim() || null;
  };

  const fromClipboard = async () => {
    try {
      return (await navigator.clipboard.readText())?.trim() || null;
    } catch {
      return null;
    }
  };

  const capture = (event, delay = 50) => {
    const text = fromEvent(event) || fromSelection();

    if (text) {
      return send(text);
    }

    setTimeout(async () => send(await fromClipboard()), delay);
  };

  document.addEventListener("copy", (e) => capture(e), true);

  document.addEventListener("cut", (e) => capture(e), true);

  document.addEventListener(
    "keydown",
    (e) => {
      const key = e.key?.toLowerCase();
      
      const mod = e.ctrlKey || e.metaKey;

      if (
        !mod ||
        (key !== "c" && key !== "x" && !(key === "insert" && e.shiftKey))
      ){
        return;
      }

      capture(null, 80);
    },
    true,
  );
})();
