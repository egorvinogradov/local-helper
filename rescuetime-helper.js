const LINK_STYLE = `
  margin-left: 8px;
  font-size: 0.8em;
  border-left: 1px solid rgba(0,0,0,.1);
  padding-left: 8px;
`;

function getNewLinkElementsArray(){
  var selector = 'a[href^="https://www.rescuetime.com/browse/activities/"]:not(.lh-patched)';
  return Array.prototype.slice.apply(document.querySelectorAll(selector));
}

function createElement(tagName, attributes) {
  var el = document.createElement(tagName);
  for (var key in attributes) {
    el[key] = attributes[key];
  }
  return el;
}

function createHistoryLinkElement(domain){
  var historyLinkElement = createElement('a', {
    target: '_blank',
    href: `chrome://history/?q=${domain}`,
    innerText: 'View history',
    style: LINK_STYLE
  });
  historyLinkElement.addEventListener('click', function(e){
    chrome.runtime.sendMessage({action: 'openTab', zzz: '2222', url: e.currentTarget.href});
    e.preventDefault();
  });
  return historyLinkElement;
}

function createBrowseLinkElement(domain){
  return createElement('a', {
    target: '_blank',
    href: `http://${domain}`,
    innerText: 'Browse',
    style: LINK_STYLE
  });
}

function insetAfter(referenceElement, newElement){
  referenceElement.nextSibling.parentNode.insertBefore(newElement, referenceElement.nextSibling);
}

function patchNewsLinks(linkElements){
  linkElements.forEach(function(el){
    domain = el.innerText;
    insetAfter(el, createHistoryLinkElement(domain));
    insetAfter(el, createBrowseLinkElement(domain));
    el.classList.add('lh-patched');
  });
}

function initialize(){
  patchNewsLinks(getNewLinkElementsArray());
  setInterval(function(){
    var newlinks = getNewLinkElementsArray();
    if (newlinks.length) {
      patchNewsLinks(newlinks);
      console.log('PATCHED', {els: newlinks});
    }
    else {
      console.log('no new links');
    }
  }, 2 * 1000);
}

initialize();
