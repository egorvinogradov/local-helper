const LINK_STYLE = `
  margin-left: 5px;
  font-size: 0.8em;
  border-left: 1px solid rgba(0,0,0,.1);
  padding-left: 6px;
`;

function getNewLinkElementsArray(){
  var selector = '.report-table a[href^="https://www.rescuetime.com/browse/activities/"]:not(.lh-patched)';
  return Array.prototype.slice.apply(document.querySelectorAll(selector));
}

function createElement(tagName, attributes) {
  var el = document.createElement(tagName);
  for (var key in attributes) {
    el[key] = attributes[key];
  }
  return el;
}

function createBrowserHistoryLinkElement(domain){
  var browserHistoryLinkElement = createElement('a', {
    target: '_blank',
    href: `chrome://history/?q=${domain}`,
    innerText: 'Browser',
    style: LINK_STYLE
  });
  browserHistoryLinkElement.addEventListener('click', function(e){
    chrome.runtime.sendMessage({action: 'openTab', url: e.currentTarget.href});
    e.preventDefault();
  });
  return browserHistoryLinkElement;
}

function createGoogleHistoryLinkElement(domain){
  return createElement('a', {
    target: '_blank',
    href: `https://myactivity.google.com/myactivity?q=%22${domain}%22`,
    innerText: 'Google',
    style: LINK_STYLE
  });
}

function createOpenLinkElement(domain){
  return createElement('a', {
    target: '_blank',
    href: `http://${domain}`,
    innerText: 'Open Website',
    style: LINK_STYLE + `margin-left: 12px; border: 0;`
  });
}

function insetAfter(referenceElement, newElement){
  referenceElement.nextSibling.parentNode.insertBefore(newElement, referenceElement.nextSibling);
}

function patchNewsLinks(linkElements){
  linkElements.forEach(function(el){
    domain = el.innerText;
    insetAfter(el, createGoogleHistoryLinkElement(domain));
    insetAfter(el, createBrowserHistoryLinkElement(domain));
    insetAfter(el, createOpenLinkElement(domain));
    el.classList.add('lh-patched');
  });
}

function initialize(){
  patchNewsLinks(getNewLinkElementsArray());
  setInterval(function(){
    var newlinks = getNewLinkElementsArray();
    if (newlinks.length) {
      patchNewsLinks(newlinks);
    }
  }, 2 * 1000);
}

initialize();
