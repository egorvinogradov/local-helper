window.__currentPrompt = '';
window.__currentRepliesNumber = 0;
window.__currentFirstReplyText = '';


function saveToLocalStorage(key, value) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}


function getFromLocalStorage(key){
  try {
    return JSON.parse(localStorage.getItem('lh-' + key));
  }
  catch (e) {
    return;
  }
}


function watchContentUpdate(onUpdate){
  setInterval(() => {
    const status = checkIfPageUpdated();
    if (status.hasTextareaReset || status.haveRepliesChange) {
      onUpdate(status);
    }
  }, 500);
};


function checkIfPageUpdated(){
  const replies = document.querySelectorAll('.w-full.border-b');
  const firstReplyText = replies?.[0]?.textContent || '';

  const haveRepliesChange =
    replies.length !== window.__currentRepliesNumber ||
    firstReplyText !== window.__currentFirstReplyText;

  const hasTextareaReset = !document.querySelector('#local-helper-prompts');

  if (haveRepliesChange) {
    window.__currentRepliesNumber = replies.length;
    window.__currentFirstReplyText = firstReplyText;
  }

  return {
    haveRepliesChange,
    hasTextareaReset,
  };
}


function appendPromptSelect(prompts){
  const options = ['Prompts...', ...prompts].map((prompt, i) => {
    return `<option value="${prompt}">
      ${i ? i + '.' : ''}
      ${prompt}
    </option>`;
  });

  const select = document.createElement('select');
  select.id = 'local-helper-prompts';
  select.innerHTML = options.join('\n');
  select.style = `
    border: 0;
    width: min-content;
    padding: 0 40px 0 0;
    margin: 0 0 5px 0;
    color: gray;
    box-shadow: none;
  `;

  const textarea = getTextarea();
  const container = textarea?.parentElement;
  if (textarea && container) {
    container.insertBefore(select, container.firstChild);
  }

  return select;
}


function excludePreviousPrompt(textareaValue, previousPrompt){
  return textareaValue.replace(previousPrompt + '\n\n', '');
}


function getTextarea(){
  return document.querySelector('form textarea');
}


function setTextareaText(text){
  const textarea = getTextarea();
  const event = new Event('input', { bubbles: true });
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  nativeInputValueSetter.call(textarea, text);
  textarea.dispatchEvent(event);
  setTimeout(() => textarea.focus(), 200);
}


function onSelectChange(e){
  const textarea = getTextarea();
  const textareaText = excludePreviousPrompt(textarea.value, window.__currentPrompt);
  const prompt = e.target.value;
  window.__currentPrompt = prompt;

  const placeholderPrompt = document.querySelector('#local-helper-prompts option:first-child');
  if (prompt === placeholderPrompt.value) {
    window.__currentPrompt = '';
    setTextareaText(textareaText);
  }
  else {
    setTextareaText(prompt + '\n\n' + textareaText);
  }
}


function enableAvatarClickToCopy(){
  const botAvatars = [...document.querySelectorAll('.w-full.border-b .relative.rounded-sm.text-white.flex svg')].map(el => {
    return el.parentElement;
  });
  const userAvatars = [...document.querySelectorAll('.w-full.border-b .relative.flex img[decoding=async]')].map(el => {
    return el.parentElement;
  });

  const uninitializedAvatars = [...botAvatars, ...userAvatars].filter(avatar => {
    return !avatar.dataset.localHelperInitialized;
  });

  uninitializedAvatars.forEach(avatar => {
    avatar.dataset.localHelperInitialized = true;
    avatar.style.cursor = 'pointer';
    avatar.title = 'Click to copy the text on the right';
    avatar.addEventListener('click', onAvatarClick);
  });
}


function onAvatarClick(e){
  const avatar = e.currentTarget;
  const textToCopy = avatar.closest('.flex-col').nextSibling.textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    flashAvatar(avatar);
  });
}


function flashAvatar(avatarElement){
  avatarElement.style.boxShadow = '0 0 3px 3px #ffa44a';
  avatarElement.style.borderRadius = '2px';
  setTimeout(() => {
    avatarElement.style.boxShadow = '';
  }, 300);
}


function enablePrompts(){
  const prompts = getFromLocalStorage('chatgpt-prompts') || [];
  const select = appendPromptSelect(prompts);
  select.addEventListener('change', onSelectChange);
}


function initializePopupMessaging(){
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getChatGPTPrompts') {
      const prompts = getFromLocalStorage('chatgpt-prompts') || [];
      sendResponse(prompts);
    }
    else if (request.action === 'saveChatGPTPrompts') {
      const { prompts } = request.data || {};    
      saveToLocalStorage('chatgpt-prompts', prompts || []);
      sendResponse(true);
    }
  });
}


enablePrompts();
enableAvatarClickToCopy();
initializePopupMessaging();

watchContentUpdate(status => {
  const { haveRepliesChange, hasTextareaReset } = status;

  if (haveRepliesChange) {
    enableAvatarClickToCopy();
  }
  if (hasTextareaReset) {
    enablePrompts();
  }
});
