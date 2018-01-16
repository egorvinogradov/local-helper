if (chrome.extension.inIncognitoContext) {
  document.body.innerHTML = '';
  if (/^(www\.)?google\.com$/i.test(document.location.host)) {
    document.location.href = `https://www.google.ru${document.location.search}`;
  }
}
