chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getSelectedText') {
    sendResponse({data: window.getSelection().toString()});
  }
});
