function attachCopyButtons(){
  var taskBarEls = $('.tree-item.task .tree-list:not(:empty)').toArray().map(el => {
    return $(el).parent().find('> .tree-row > .tree-row-content > .task-menu-bar')[0];
  });
  $(taskBarEls).toArray().map(el => {
    $(el).prepend(`<i class="i-btn x30 lh-copy-tasks new-task-btn next-sibling icon-paste"></i>`);
  });
}

function onCopyButtonClick(e){
  var taskTexts = $(e.target)
    .parents('.tree-item.task')
    .eq(0)
    .find('.task-name')
    .toArray()
    .map(el => $(el).text().trim());

  console.log('Copy tasks:\n\n' + taskTexts.join('\n'));
  navigator.clipboard.writeText(taskTexts.join('\n'));
  e.preventDefault();
  e.stopPropagation();
}

function initExtension(){
  attachCopyButtons();
  $('body').delegate('.lh-copy-tasks', 'mousedown', onCopyButtonClick);
}

setTimeout(() => {
  initExtension();
}, 3000);
