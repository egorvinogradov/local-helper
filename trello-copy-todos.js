function getTodayColumnElement(){
  var todayHeaderEl = $('.list-header-name-assist.js-list-name-assist').toArray().filter(h2 => {
    return h2.innerHTML.toLowerCase().trim() === 'today';
  });
  return $(todayHeaderEl).parents('.list.js-list-content');
}


function getAllColumnElements(){
  return $('.list.js-list-content');
}


function getColumnTODOs(childEl){
  return $(childEl)
    .parents('.list.js-list-content')
    .find('.list-card-title.js-card-name')
    .toArray()
    .map(item => {
      return item.innerText.trim();
    });
}


function copyToClipboard(text){
  navigator.clipboard.writeText(text);
}

function attachCopyButton(columnEls, callback){
  var extrasIcons = columnEls.find('.list-header-extras .icon-overflow-menu-horizontal');
  var buttonHTML = `<a class="list-header-extras-menu dark-hover icon-sm icon-attachment" href="#"><div></div></a>`;

  extrasIcons.toArray().map(icon => {
    var buttonElement = $(buttonHTML).on('click', () => {
      buttonElement
        .removeClass('icon-attachment')
        .addClass('icon-check')
        .css('color', '#61bd4f');
      setTimeout(() => {
        buttonElement
          .removeClass('icon-check')
          .addClass('icon-attachment')
          .removeAttr('style');
      }, 1500);
      callback(buttonElement);
    });
    $(buttonElement).insertBefore(icon);
  });
}


// var todayColumnElement = getTodayColumnElement();
var allColumnElements = getAllColumnElements();

attachCopyButton(allColumnElements, (buttonElement) => {
  copyToClipboard(getColumnTODOs(buttonElement).join('\n'));
});
