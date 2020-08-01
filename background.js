chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { buttonClick: true }, function (
      response
    ) {});
  });
  return true;
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  return checkIfInNetflix(tab);
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    return checkIfInNetflix(tab);
  });
});

function checkIfInNetflix(tab) {
  if (isNetflixUrl(tab)) {
    setStatusIcon(tab, true);
    return true;
  }
  setStatusIcon(tab, false);
  return false;
}

function setStatusIcon(tab, enabled) {
  if (enabled)
    chrome.browserAction.setIcon({
      path: "ressources/icon-small.png",
      tabId: tab.id,
    });
  else
    chrome.browserAction.setIcon({
      path: "ressources/icon-small-disabled.png",
      tabId: tab.id,
    });
}

function isNetflixUrl(tab) {
  return tab.url.match(/.+:\/\/.+netflix\.com\/watch\//);
}
