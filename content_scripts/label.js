browser.runtime.onMessage.addListener(handleMessage);

// Create the container element (but don't add it yet)
const section = document.createElement("section");
const ul = document.createElement("ul");
const li = document.createElement("li");

ul.appendChild(li);
section.appendChild(ul);

// ----- Initial Load -----
applySavedStylesForCurrentUrl();

// ----- Handle Messages from Popup -----
function handleMessage(request, sender, sendResponse) {
  if (request.applyStyles && request.styles) {
    applySavedStylesForCurrentUrl();
  } else if (request.reset) {
    section.removeAttribute("style");
    document.body.style.border = "";
    if (section.parentNode) {
      section.remove(); // clean up the injected element
    }
  }
}

// ----- Core Functions -----

function applyStyles(styles) {
  document.body.style.border = "5px solid " + styles.backgroundColor;

  for (let key in styles) {
    if (styles.hasOwnProperty(key)) {
      section.style[key] = styles[key];
    }
  }

  li.textContent = styles.label; // Set label as content
  if (!section.isConnected && styles.label) {
    document.body.insertBefore(section, document.body.firstChild);
  }
}

function applySavedStylesForCurrentUrl() {
  const currentUrl = window.location.href;

  browser.storage.local.get().then((items) => {
    for (let key in items) {
      const styleEntry = items[key];
      if (styleEntry.urls && urlMatches(currentUrl, styleEntry.urls)) {
        applyStyles(styleEntry); // only apply if it matches
        break; // apply first match only
      }
    }
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

