if (chrome.extension.inIncognitoContext) {
  document.body.innerHTML = '';
  if (/^(www\.)?google\.com$/i.test(location.host)) {
    location.href = `https://www.google.ru${location.pathname}${location.search}`;
  }
}
