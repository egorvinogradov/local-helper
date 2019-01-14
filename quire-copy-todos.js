function getSelectedTaskNames(){
  return $('.task.selected')
    .toArray()
    .map(el => $(el).find('> .tree-row .task-name').text() );
}

function initExtension(){
  var html = `
    <div class="btn-wrap">
      <a class="lh-copy-tasks icon-paste i-btn x30" href="#" data-toggle="quire-popover" data-tooltip="Complete"></a>
    </div>
  `;
  $('.ws-bottom-bar .btn-row').prepend(html);
  $('.lh-copy-tasks').on('click', e => {
    var tasks = getSelectedTaskNames();
    navigator.clipboard.writeText(tasks.join('\n'));
  });
}

setTimeout(() => {
  initExtension();
}, 3000);
