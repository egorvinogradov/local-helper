if (chrome.extension.inIncognitoContext) {
  document.body.innerHTML = '';
  document.location.href = document.location.href.replace('https://www.google.com', 'https://www.google.ru');
}
