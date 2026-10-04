const DEFAULT_PETAL_COUNT = 8;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "getRecentHistory") {
    getRecentUniqueHosts(message.limit || DEFAULT_PETAL_COUNT).then(sendResponse);
    return true; // keep the message channel open for the async response
  }

  if (message?.type === "openUrl") {
    chrome.tabs.create({ url: message.url });
  }
});

async function getRecentUniqueHosts(limit) {
  const items = await chrome.history.search({
    text: "",
    maxResults: 500,
    startTime: 0,
  });

  items.sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0));

  const seenHosts = new Set();
  const results = [];

  for (const item of items) {
    if (!item.url) continue;

    let url;
    try {
      url = new URL(item.url);
    } catch {
      continue;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    if (seenHosts.has(url.hostname)) continue;

    seenHosts.add(url.hostname);
    results.push({
      url: item.url,
      title: item.title || url.hostname,
      hostname: url.hostname,
    });

    if (results.length >= limit) break;
  }

  return results;
}
