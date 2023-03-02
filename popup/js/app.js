function saveLocalValue(key, value) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}

function getLocalValue(key){
  try {
    return JSON.parse(localStorage.getItem('lh-' + key));
  }
  catch (e) {
    return;
  }
}

function copyToClipboard(value){
  var clipboard = $('#lh-clipboard');
  clipboard.val(value);
  clipboard.select();
  document.execCommand('copy');
}

function parseSettingsForm(){
  const emails = $('#b-settings-emails').val().trim().split(/\n/);
  const chatGPTPrompts = $('#b-settings-chatgpt-prompts').val().trim()
    .split(/\n/)
    .filter(str => str.trim());

  return {
    chatGPTPrompts,
    emails,
  };
}

function saveSettings(){
  const { chatGPTPrompts, emails } = parseSettingsForm();
  saveLocalValue('settings-emails', emails);
  saveLocalValue('settings-chatgpt-prompts', chatGPTPrompts);

  $('#b-settings-save').attr('disabled', true).text('Saving...');
  setTimeout(() => {
    $('#b-settings-save').attr('disabled', false).text('Save');
  }, 700);
}

function restoreSettingsForm(){
  const emails = getLocalValue('settings-emails') || [];
  const chatGPTPrompts = getLocalValue('settings-chatgpt-prompts') || [];

  $('#b-settings-emails').val(emails.join('\n'));
  $('#b-settings-chatgpt-prompts').val(chatGPTPrompts.join('\n\n'));
}

function renderEmailToCopyList(callback){
  const { emails } = parseSettingsForm();

  getURLBasedKeyword(keyword => {
    const emailsListHTML = emails.map(email => {
      const emailWithKeyword = email.split('@')[0]
        + '+'
        + keyword
        + '@'
        + email.split('@')[1];

      return `
        <div class="text-nowrap mb-3">
          <button
            class="b-emails-primary btn btn-outline-secondary"
            data-email="${email}">
            ${email}
          </button>
          <button
            style="max-width: 150px; overflow: hidden;"
            class="b-emails-keyword btn btn-outline-secondary ml-2"
            data-email="${emailWithKeyword}">
          +${keyword}
          </button>
        </div>
      `;
    });

    $('.b-emails-list').html(emailsListHTML.join('\n'));
    requestAnimationFrame(callback);
  });
}

function initEmailToCopyEvents(){
  $('.b-emails-primary, .b-emails-keyword').on('click', e => {
    copyToClipboard($(e.currentTarget).data('email'));
    $(e.currentTarget).attr('disabled', true);
    setTimeout(() => {
      $(e.currentTarget).attr('disabled', false);
      window.close();
    }, 100);
  });
}

function getURLBasedKeyword(callback){
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;
    const host = new URL(url).host.split('.');
    const keyword = host[host.length - 2] || host.join('.');
    callback(keyword);
  });
}

restoreSettingsForm();
renderEmailToCopyList(initEmailToCopyEvents);
$('#b-settings-save').on('click', saveSettings);


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.type === 'getLocalStorage') {
    const data = getLocalValue(message.key);
    sendResponse('lololo');
  }
});



// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type:"msg_from_popup"}, function(response){
//     alert(response)
//     });
// });
