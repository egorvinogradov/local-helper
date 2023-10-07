function saveToLocalStorage(key, value, callback) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}


function getFromLocalStorage(key, callback){
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
  const emailsTextarea = $('#b-settings-emails');
  const promptsTextarea = $('#b-settings-chatgpt-prompts');

  const emails = emailsTextarea.val().trim().split(/\n/);

  let prompts = [];
  if ( !promptsTextarea.attr('disabled') ) {
    prompts = promptsTextarea
      .val()
      .trim()
      .split(/\n/)
      .filter(str => str.trim());
  }

  return { prompts, emails };
}


function saveSettings(){
  const saveButton = $('#b-settings-save');
  const { emails, prompts } = parseSettingsForm();

  saveToLocalStorage('settings-emails', emails);

  if (prompts.length) {
    sendMessageToChatGPTTab('saveChatGPTPrompts', { prompts }, response => {
      if (response.error) {
        alert('CAN\'T SAVE CHATGPT PROMPTS. OPEN HTTPS://CHAT.OPENAI.COM/CHAT AND TRY AGAIN');
      }
    });
  }

  saveButton.attr('disabled', true).text('Saving...');
  setTimeout(() => {
    saveButton.attr('disabled', false).text('Save');
    renderEmailToCopyList();
  }, 700);
}


function restoreSettingsFormEmails(){
  const emails = getFromLocalStorage('settings-emails') || [];
  $('#b-settings-emails').val(emails.join('\n'));
}


function restoreSettingsFormPrompts(prompts){
  const promptsTextarea = $('#b-settings-chatgpt-prompts');

  if (prompts?.length) {
    promptsTextarea.val(prompts.join('\n\n'));
  }
  else if (prompts.error) {
    promptsTextarea
      .attr({ disabled: true })
      .val('OPEN HTTPS://CHAT.OPENAI.COM/CHAT AND TRY AGAIN');
  }
}


function renderEmailToCopyList(callback){
  const emails = getFromLocalStorage('settings-emails') || [];

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

    if (callback) {
      requestAnimationFrame(callback);
    }
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


function sendMessageToChatGPTTab(messageType, data, callback){
  chrome.tabs.query({ url: 'https://chat.openai.com/*' }, tabs => {
    const messageOptions = {
      action: messageType,
      data,
    };
    if (!tabs[0]) {
      callback({ error: true });
    }
    else {
      chrome.tabs.sendMessage(tabs[0].id, messageOptions, callback);
    }
  });
}


renderEmailToCopyList(initEmailToCopyEvents);
restoreSettingsFormEmails();

sendMessageToChatGPTTab('getChatGPTPrompts', null, response => {
  restoreSettingsFormPrompts(response);
});

$('#b-settings-save').on('click', saveSettings);
