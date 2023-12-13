const TAB_WILDCARD_CHATGPT = 'https://chat.openai.com/*';

function saveToLocalStorage(key, value) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}


function getFromLocalStorage(key){
  try {
    return JSON.parse(localStorage.getItem('lh-' + key));
  }
  catch (e) {}
}


function copyToClipboard(value){
  const clipboard = $('#lh-clipboard');
  clipboard.val(value);
  clipboard.select();
  document.execCommand('copy');
}


function parseSettingsForm(){
  const emailsTextarea = $('#b-settings-emails');
  const promptsTextarea = $('#b-settings-chatgpt-prompts');
  const chatGPTKeyInput = $('#b-settings-chatgpt-api-key');

  const emails = emailsTextarea.val().trim().split(/\n/);

  let prompts = [];
  if ( !promptsTextarea.attr('disabled') ) {
    prompts = promptsTextarea
      .val()
      .trim()
      .split(/\n/)
      .filter(str => str.trim());
  }

  const chatGPTAPIKey = chatGPTKeyInput.val().trim();

  return { prompts, emails, chatGPTAPIKey };
}


function saveSettings(){
  const saveButton = $('#b-settings-save');
  const { emails, prompts, chatGPTAPIKey } = parseSettingsForm();

  saveToLocalStorage('settings-emails', emails);
  saveToLocalStorage('settings-chat-key', chatGPTAPIKey);

  if (prompts.length) {
    sendMessageToTab(TAB_WILDCARD_CHATGPT, 'saveChatGPTPrompts', { prompts }, response => {
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


function restoreSettingsForm(){
  const emails = getFromLocalStorage('settings-emails') || [];
  const chatGPTAPIKey = getFromLocalStorage('settings-chat-key') || '';
  $('#b-settings-emails').val(emails.join('\n'));
  $('#b-settings-chatgpt-api-key').val(chatGPTAPIKey);
}


function restoreSettingsFormPrompts(prompts){
  const promptsTextarea = $('#b-settings-chatgpt-prompts');

  if (prompts?.length) {
    promptsTextarea.val(prompts.join('\n\n'));
  }
  else if (prompts?.error) {
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


function sendMessageToTab(urlWildcard, messageType, data, callback){
  chrome.tabs.query({ url: urlWildcard }, tabs => {
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


function getSelectedTextInCurrentTab(callback){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { method: 'getSelectedText' }, (response) => {
      const selectedText = (response?.data || '').trim();
      if (selectedText){
        callback(selectedText);
      }
    });
  });
}


function askChatGPT(question, apiKey) {
  const messages = question instanceof Array
    ? question
    : [{ role: 'user', content: question }];

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({ model: 'gpt-4', messages })
  }).then(res => res.json())
}


function extractChatGPTResponseText(response){
  try {
    const rawText = response.choices[0].message.content.trim() || '';
    const textWithoutWrappingQuotes = rawText.replace(/^"/, '').replace(/"$/, '').trim();
    return textWithoutWrappingQuotes.includes('"') ? rawText : textWithoutWrappingQuotes;
  }
  catch(e) {
    showChatGPTError('Error while parsing ChatGPT response', { e, response });
  }
}


function showChatGPTError(message, data){
  const fullMessage = message + '. See window.__chatGPTError in console.';
  window.__chatGPTError = data;
  console.error(window.__chatGPTError);
  alert(fullMessage);
  throw fullMessage;
}


function initializeChatGPTTranslation(selectedText){
  const API_KEY = $('#b-settings-chatgpt-api-key').val();
  const TRANSLATE_PROMPT = `Translate the following word or phrase to Russian (if it's already in Russian then translate to English) and return a translated string only, without any comments.`;
  const TRANSLATE_MORE_PROMPT = 'Another variant';
  const EXPLAIN_PROMPT = `Give a very short explanation in Russian of what the following word or phrase means and return the explanation only as a string, without any comments.`;

  const translationTab = $('[data-toggle="tab"][href="#chatgpt"]');
  const comment = $('.b-translation-comment');
  const title = $('.b-translation-title');
  const variants = $('.b-translation-variants');
  const more = $('.b-translation-more');
  const explain = $('.b-translation-explain');

  translationTab.click();
  comment.hide();
  title.text(`Translating "${selectedText}"...`);
  explain.removeClass('d-none');

  const translationMessageHistory = [];
  const initialPrompt = `${TRANSLATE_PROMPT}:\n"${selectedText}"`;
  translationMessageHistory.push({ role: 'user', content: initialPrompt });

  askChatGPT(initialPrompt, API_KEY).then(extractChatGPTResponseText).then(translation => {
    translationMessageHistory.push({ role: 'assistant', content: translation });
    title.html(`"${selectedText}" translation <a class="ml-1 fa fa-window-restore" href="https://translate.yandex.ru/?text=${selectedText}" target="_blank"></a>`);
    variants.append(`<li>${translation} <i class="fa"></i></li>`);
    more.removeClass('d-none');
  });

  more.on('click', () => {
    translationMessageHistory.push({ role: 'user', content: TRANSLATE_MORE_PROMPT });
    more.text('More...').attr('disabled', true);

    askChatGPT(translationMessageHistory, API_KEY).then(extractChatGPTResponseText).then(translation => {
      translationMessageHistory.push({ role: 'assistant', content: translation });
      variants.append(`<li>${translation}</li>`);
      more.text('More').attr('disabled', false);
    });
  });

  explain.on('click', () => {
    const prompt = `${EXPLAIN_PROMPT}:\n"${selectedText}"`;
    explain.text('Explain...').attr('disabled', true);

    askChatGPT([{ role: 'user', content: prompt, }], API_KEY).then(extractChatGPTResponseText).then(explanation => {
      variants.append(`<li>${explanation}</li>`);
      explain.text('Explain').attr('disabled', false);
    });
  });
}


renderEmailToCopyList(initEmailToCopyEvents);
restoreSettingsForm();

sendMessageToTab(TAB_WILDCARD_CHATGPT , 'getChatGPTPrompts', null, response => {
  restoreSettingsFormPrompts(response);
});

getSelectedTextInCurrentTab(selectedText => {
  if (selectedText) {
    initializeChatGPTTranslation(selectedText);
  }
});

$('#b-settings-save').on('click', saveSettings);
