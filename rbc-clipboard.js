/**
 * Fixes clipboard on rbc.ru
 */

document.addEventListener('copy', function(){
  const selection = window.getSelection();
  const clipboard = selection.toString().split(/\n\nПодробнее на РБК:/m)[0];
  const el = document.createElement('div');
  const body = document.getElementsByTagName('body')[0];

  el.style.position = 'absolute';
  el.style.left = '-99999px';
  el.innerHTML = clipboard;
  body.appendChild(el);
  selection.selectAllChildren(el);
  setTimeout(function(){
    body.removeChild(el);
  }, 0);

}, false);
