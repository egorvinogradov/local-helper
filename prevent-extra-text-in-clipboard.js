/**
 * Prevents annoying extra text from being added to clipboard while copying text on various websites
 * Works on:
 * - www.rbc.ru
 * - notion.so
 */


const DOMAIN_HANDLERS = {
  'www.rbc.ru': text => {
    return text.split(/\n\nПодробнее на РБК:/m)[0];
  },
  'www.securitylab.ru': text => {
    return text.split(/Подробнее:/)[0].trim();
  },
};

document.addEventListener('copy', function(e){
  e.preventDefault();
  e.stopPropagation();
  let text = window.getSelection().toString();

  if (DOMAIN_HANDLERS[location.hostname]) {
    text = DOMAIN_HANDLERS[location.hostname](text, e);
  }
  navigator.clipboard.writeText(text);
}, false);
