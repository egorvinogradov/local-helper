const AXURE_FILES_CDN_ROOT = 'https://axure-lead-prototype.surge.sh';

function detectAxurePrototype(){
  return document.getElementById('leftPanel')
    || document.getElementsByClassName('vsplitbar').length
    || document.getElementsByClassName('ax_default').length;
}

function appendMetaViewport(){
  var tag = document.createElement('meta');
  tag.name = 'viewport';
  tag.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(tag);
}

function appendCSS(){
  var tag = document.createElement('link');
  tag.href = AXURE_FILES_CDN_ROOT + '/styles_ios.css';
  tag.rel = 'stylesheet';
  document.head.appendChild(tag);
}

function replaceRetinaImages(){
  var imgs = document.querySelectorAll('[data-label^=z_] > img');
  Array.prototype.slice.apply(imgs).map(function(img){
    var label = img.parentNode.dataset.label;
    img.src = AXURE_FILES_CDN_ROOT + '/images-patched/' + label + '.png';
  });
}

if ( detectAxurePrototype() ) {
  appendMetaViewport();
  appendCSS();
  replaceRetinaImages();
}
