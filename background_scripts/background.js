
function getActiveTab() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

function applyStoredStyleToActiveTab() {
  getActiveTab().then((tabs) => {
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;

    browser.storage.local.get().then((items) => {
      for (let key in items) {
        const styleEntry = items[key];
        if (styleEntry.urls && urlMatches(currentUrl, styleEntry.urls)) {
          browser.tabs.sendMessage(currentTab.id, {
            applyStyles: true,
            styles: styleEntry
          });
          break; // Stop after the first matching rule
        }
      }
    });
  });
}

function urlMatches(currentUrl, savedUrlField) {
  const patterns = savedUrlField.split(",").map(s => s.trim());

  return patterns.some(pattern => {
    // Check if the pattern is a wildcard or a direct substring match
    if (pattern.includes('*')) {
      // Replace '*' with an empty string to perform a simple substring match
      pattern = pattern.replace('*', '');
      return currentUrl.indexOf(pattern) !== -1;
    } else {
      return currentUrl.indexOf(pattern) !== -1;
    }
  });
}


// Trigger style application on tab events
browser.tabs.onUpdated.addListener(applyStoredStyleToActiveTab);
browser.tabs.onActivated.addListener(applyStoredStyleToActiveTab);

