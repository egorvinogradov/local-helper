chrome.runtime.onMessage.addListener(function(request) {
  if (request.action === 'openTab') {
    chrome.tabs.create({
      url: request.url,
      active: true
    });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  var tabUrl;
  try {
    tabUrl = decodeURIComponent(changeInfo.url);
  }
  catch (e) {}
  if (tabUrl === 'https://www.google.com/search?q=п' && changeInfo.status === 'loading') {
    chrome.tabs.update(tabId, {url: 'https://www.google.com'});
  }
});
