# FlowerGUI (Browser Extension)

A Chrome extension companion to the [FlowerGUI](https://github.com/Brianmanden/FlowerGUI) desktop app. Hold **Ctrl + Shift** and **right-click** anywhere on a webpage to open a flower-shaped radial launcher for your most recently visited sites.

It's **Work In Progress**, so you may find that not all features are working properly.

## ✨ Features

- **Global Hotkey**: Trigger the launcher on any webpage with **Ctrl + Shift** + **Right Click**
- **Radial History Launcher**: Petals are populated from your most recent browser history (deduped by domain), complete with favicon and page title
- **Flower Positioning**: The flower's center opens exactly at your cursor, clamped inward near viewport edges so it's never clipped off-screen
- **Quick Close**: Press **Esc** or click anywhere outside the flower to dismiss it

## 🚀 How to use it

1. **Activate**: On any regular webpage, hold **Ctrl + Shift** and **right-click**
2. **Choose a page**: Click one of the petal-shaped buttons to open that page in a new tab
3. **Close**: Press **Esc**, or click anywhere outside the flower, to dismiss it without choosing anything

## 📦 Installation

This extension isn't published to the Chrome Web Store — it's loaded as an unpacked extension:

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this project's root folder (`FlowerGUIBrowserExtension`)
5. The FlowerGUI extension should now appear in your extensions list

If you tinker and make code changes, click the reload icon (⟳) on the extension's card in `chrome://extensions`, then refresh any already-open tabs you're testing in.

## 🔐 Permissions

| Permission | Why it's needed |
|---|---|
| `history` | To read your recent browsing history and populate the petals |
| `favicon` | To display each site's favicon on its petal |
| `tabs` | To open a petal's link in a new tab |
| `host_permissions: <all_urls>` | To inject the content script (hotkey listener + flower overlay) on any page you're browsing |

## ⚠️ Known limitations

- Only works in Chrome/Chromium-based browsers (built as a Manifest V3 extension); not tested in Firefox or Safari
- Won't trigger on `chrome://` pages, the Chrome Web Store, or the built-in PDF viewer — Chrome doesn't allow content scripts to run there
- Petals only link to `http(s)` pages from your history; other schemes (e.g. `file://`) are filtered out
