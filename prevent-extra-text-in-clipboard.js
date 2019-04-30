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

  navigator.permissions.query({name: 'clipboard-write'}).then(function(permissionStatus) {
    console.log('clipboard-write permission state is ', permissionStatus.state);

    permissionStatus.onchange = function() {
      console.log('clipboard-write permission state has changed to ', this.state);
    };
  });

  navigator.clipboard.writeText(text).catch(err => {
    console.error('Could not copy text: ', err);
  });
}, false);
