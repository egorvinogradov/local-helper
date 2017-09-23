chrome.runtime.onMessage.addListener(function(request) {
  if (request.action === 'openTab') {
    chrome.tabs.create({
      url: request.url,
      active: true
    });
  }
});
