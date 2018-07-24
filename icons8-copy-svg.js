function getSVGOuterHTML(container){
  var icon = container.querySelector('svg');
  if (!icon) {
    return null;
  }
  var attrs = Array.prototype.map.call(icon.attributes, function(attr){
    return attr.name + '="' +  attr.value + '"';
  }).join(' ');
  return '<svg ' + attrs + '>' + icon.innerHTML + '</svg>';
}

function getSVGfromBase64(container) {
  var icon = container.querySelector('img[src^=data]');
  var encoded = icon.src.split('base64,')[1];
  return atob(encoded);
}

function setUpClipboard(){
  var clipboardEl = document.createElement('div');
  clipboardEl.style = 'position: absolute; left: -100em';
  clipboardEl.innerHTML = '<textarea id="local-helper-clipboard"></textarea>';
  document.body.appendChild(clipboardEl);
}

function copyToClipboard(text){
  var clipboardEl = document.getElementById('local-helper-clipboard');
  clipboardEl.value = text;
  clipboardEl.select();
  document.execCommand('copy');
  clipboardEl.blur();
  clipboardEl.value = '';
}

function renderCopyButton(container){
  var container = container.parentNode;
  var button = document.createElement('div');
  button.style = 'padding: 3px 0 5px 0;border: 1px solid rgba(0, 0, 0, 0.2);cursor: pointer;width: 60px;margin: 0 auto 5px auto;';
  button.innerHTML = 'Copy';
  container.appendChild(button);
  return button;
}

function initializeSVGClipboard(containerSelector){
  setUpClipboard();
  var container = document.querySelector(containerSelector);
  var button = renderCopyButton(container);
  button.addEventListener('click', function(){
    var svgCode = getSVGOuterHTML(container);
    if (!svgCode) {
      svgCode = getSVGfromBase64(container);
    }
    copyToClipboard(svgCode);
    alert('Copied');
  }, false);
}

initializeSVGClipboard('.icon-preview__svg');
