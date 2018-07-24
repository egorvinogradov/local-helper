function getTodayColumnElement(){
  var todayHeaderEl = $('.list-header-name-assist.js-list-name-assist').toArray().filter(h2 => {
    return h2.innerHTML.toLowerCase().trim() === 'today';
  });
  return $(todayHeaderEl).parents('.list.js-list-content');
}

function getColumnTODOs(){
  var todayHeaderEl = $('.list-header-name-assist.js-list-name-assist').toArray().filter(h2 => {
    return h2.innerHTML.toLowerCase().trim() === 'today';
  });
  return $(todayHeaderEl)
    .parents('.list.js-list-content')
    .find('.list-card-title.js-card-name')
    .toArray()
    .map(item => {
      return item.innerText.trim();
    });
}

function setUpClipboard(){
  var clipboardHTML = `
    <div style="position: absolute; left: -100em">
      <textarea id="local-helper-clipboard"></textarea>
    </div>
  `;
  $('body').append(clipboardHTML);
}

function copyToClipboard(text){
  var clipboardEl = $('#local-helper-clipboard');
  clipboardEl.val(text);
  clipboardEl.get(0).select();
  document.execCommand('copy');
  clipboardEl.get(0).blur();
  clipboardEl.val('');
}

function attachCopyButton(columnEl, callback){
  var extrasIcon = columnEl.find('.list-header-extras .icon-overflow-menu-horizontal');
  var buttonHTML = `<a class="list-header-extras-menu dark-hover icon-lg icon-attachment" href="#"><div></div></a>`;

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
    callback();
  });
  $(buttonElement).insertBefore(extrasIcon);
}


var todayColumnElement = getTodayColumnElement();

setUpClipboard();
attachCopyButton(todayColumnElement, () => {
  copyToClipboard(getColumnTODOs(todayColumnElement).join('\n'));
});
