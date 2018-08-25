function attachCopyButtonsToSidebar(){  
  var copyIcon = $('<div style="padding-top: 5px"><button>Copy</button></div>');
  copyIcon.on('click', (e) => {
    var svgCode = $(e.target).parents('.similar-icons-icon').find('.app-icon').html();
    navigator.clipboard.writeText(svgCode);
  });
  $('.similar-icons-icon').append(copyIcon);
}


$('.icon-grid').delegate('a.icon', 'mousedown', (e) => {
  setTimeout(attachCopyButtonsToSidebar, 1000);
});

attachCopyButtonsToSidebar();
