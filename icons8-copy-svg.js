function getSVGOuterHTML(selector){
  var icon = document.querySelector(selector);
  var attrs = Array.prototype.map.call(icon.attributes, function(attr){
    return attr.name + '="' +  attr.value + '"';
  }).join(' ');
  return '<svg ' + attrs + '>' + icon.innerHTML + '</svg>';
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
  clipboardEl.select()
  document.execCommand('copy');
  clipboardEl.blur()
  clipboardEl.value = '';
}

function renderCopyButton(containerSelector){
  var container = document.querySelector(containerSelector).parentNode.parentNode;
  var button = document.createElement('div');
  button.style = 'padding: 3px 0 5px 0;border: 1px solid rgba(0, 0, 0, 0.2);cursor: pointer;width: 60px;margin: 0 auto 5px auto;';
  button.innerHTML = 'Copy';
  container.appendChild(button);
  return button;
}

function initializeSVGClipboard(selector){
  setUpClipboard();
  var button = renderCopyButton(selector);
  button.addEventListener('click', function(){
    var svgCode = getSVGOuterHTML(selector);
    copyToClipboard(svgCode);
    alert('Copied');
  }, false);
}

initializeSVGClipboard('.icon-preview__svg svg');
