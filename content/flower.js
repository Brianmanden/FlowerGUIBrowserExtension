(function () {
  const PETAL_COUNT = 8;

  // Must stay in sync with content/flower.css
  const CENTER_GAP = 40;
  const PETAL_WIDTH = 90;
  const PETAL_HEIGHT = 143; // 110 * 1.3
  const PETAL_FAR_EDGE = CENTER_GAP + PETAL_HEIGHT;
  const FLOWER_HALF_EXTENT = Math.sqrt(
    Math.pow(PETAL_WIDTH / 2, 2) + Math.pow(PETAL_FAR_EDGE, 2)
  );

  let shadowHost = null;
  let shadowRoot = null;
  let isOpen = false;

  document.addEventListener(
    "contextmenu",
    (e) => {
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        openFlower(e.clientX, e.clientY);
      }
    },
    true
  );

  // The browser's native "Shift+Click extends the selection" behavior
  // fires on mousedown, before contextmenu, so by the time the handler
  // above runs it's too late -- the page's text selection has already
  // been changed (or created from nothing). Block it at the source for
  // this specific combo, without touching mousedown in any other case.
  document.addEventListener(
    "mousedown",
    (e) => {
      if (e.button === 2 && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
      }
    },
    true
  );

  function ensureHost() {
    if (shadowHost) return;

    shadowHost = document.createElement("div");
    shadowHost.id = "flowergui-host";
    document.documentElement.appendChild(shadowHost);

    shadowRoot = shadowHost.attachShadow({ mode: "open" });

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL("content/flower.css");
    shadowRoot.appendChild(style);

    const container = document.createElement("div");
    container.className = "flowergui-container";
    container.innerHTML = `
      <div class="flowergui-center"></div>
      <div class="flowergui-petals"></div>
    `;
    shadowRoot.appendChild(container);
  }

  async function openFlower(cursorX, cursorY) {
    ensureHost();
    isOpen = true;

    const container = shadowRoot.querySelector(".flowergui-container");
    const petalsEl = shadowRoot.querySelector(".flowergui-petals");
    petalsEl.innerHTML = "";

    positionFlower(container, cursorX, cursorY);
    container.classList.add("flowergui-visible");

    let history = [];
    try {
      history = await chrome.runtime.sendMessage({
        type: "getRecentHistory",
        limit: PETAL_COUNT,
      });
    } catch (err) {
      console.warn("FlowerGUI: failed to load history", err);
    }

    if (!isOpen) return; // closed while awaiting history

    if (!history || history.length === 0) {
      const empty = document.createElement("div");
      empty.className = "flowergui-empty";
      empty.textContent = "No recent history to show";
      petalsEl.appendChild(empty);
      return;
    }

    buildPetals(history).forEach((petal) => petalsEl.appendChild(petal));

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("mousedown", onOutsideMouseDown, true);
  }

  function closeFlower() {
    if (!isOpen) return;
    isOpen = false;

    const container = shadowRoot?.querySelector(".flowergui-container");
    container?.classList.remove("flowergui-visible");

    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("mousedown", onOutsideMouseDown, true);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeFlower();
    }
  }

  function onOutsideMouseDown(e) {
    if (!shadowHost) return;
    if (!e.composedPath().includes(shadowHost)) {
      closeFlower();
    }
  }

  function buildPetals(historyItems) {
    const angleIncrement = 360 / historyItems.length;

    return historyItems.map((item, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "flowergui-petal-wrapper";
      wrapper.style.setProperty("--angle", `${i * angleIncrement}deg`);

      const petal = document.createElement("button");
      petal.className = "flowergui-petal";
      petal.type = "button";
      petal.title = item.title;

      const content = document.createElement("div");
      content.className = "flowergui-petal-content";

      const favicon = document.createElement("img");
      favicon.className = "flowergui-favicon";
      favicon.alt = "";
      favicon.addEventListener("error", () => favicon.remove());
      favicon.src = chrome.runtime.getURL(
        `_favicon/?pageUrl=${encodeURIComponent(item.url)}&size=32`
      );

      const label = document.createElement("span");
      label.className = "flowergui-label";
      label.textContent = item.title;

      content.appendChild(favicon);
      content.appendChild(label);
      petal.appendChild(content);

      petal.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "openUrl", url: item.url });
        closeFlower();
      });

      wrapper.appendChild(petal);
      return wrapper;
    });
  }

  function positionFlower(container, cursorX, cursorY) {
    const clampedX = clamp(
      cursorX,
      FLOWER_HALF_EXTENT,
      window.innerWidth - FLOWER_HALF_EXTENT
    );
    const clampedY = clamp(
      cursorY,
      FLOWER_HALF_EXTENT,
      window.innerHeight - FLOWER_HALF_EXTENT
    );

    container.style.left = `${clampedX}px`;
    container.style.top = `${clampedY}px`;
  }

  function clamp(value, min, max) {
    // window can be narrower than the flower itself; fall back to centering
    if (min > max) return (min + max) / 2;
    return Math.min(Math.max(value, min), max);
  }
})();
