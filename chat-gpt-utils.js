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

  const hasTextareaReset = !getSelect();

  if (haveRepliesChange) {
    window.__currentRepliesNumber = replies.length;
    window.__currentFirstReplyText = firstReplyText;
  }

  return {
    haveRepliesChange,
    hasTextareaReset,
  };
}

function excludePreviousPrompt(textareaValue, previousPrompt){
  return textareaValue.replace(previousPrompt + '\n\n', '');
}


function getTextarea(){
  return document.querySelector('form textarea');
}

function getSelect(){
  return document.querySelector('#local-helper-prompts');
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


function initializeSelect(){
  const prompts = getFromLocalStorage('chatgpt-prompts') || [];

  const options = ['Prompts...', ...prompts].map((prompt, i) => {
    return `<option value="${prompt}">
      ${i ? i + '.' : ''}
      ${prompt}
    </option>`;
  });

  const select = document.createElement('select');
  select.id = 'local-helper-prompts';
  select.addEventListener('change', onSelectChange);

  document.addEventListener('keydown', function(e) {
    if (e.metaKey && e.keyCode === 48) { /* Cmd+0 */
      getSelect().focus();
    }
  });

  setSelectPrompts(select, prompts);
  addCustomCSS();

  const textarea = getTextarea();
  const container = textarea?.parentElement;
  if (textarea && container) {
    container.insertBefore(select, container.firstChild);
  }
}

function addCustomCSS(){
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    #local-helper-prompts {
      border: 0;
      width: min-content;
      padding: 5px;
      margin: 9px 0px -3px 11px;
      color: gray;
      box-shadow: none;
      background: none;
      position: relative;
      background: none;
      transition: opacity 200ms;
    }

    #local-helper-prompts:focus {
      background: none;
      animation: local-helper-prompts-blink 500ms infinite alternate;
    }

    @keyframes local-helper-prompts-blink {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

function setSelectPrompts(select, prompts) {
  const options = ['Prompts...', ...prompts].map((prompt, i) => {
    return `<option value="${prompt}">
      ${i ? i + '.' : ''}
      ${prompt}
    </option>`;
  });
  select.innerHTML = options.join('\n');
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
      setSelectPrompts(getSelect(), prompts);
      sendResponse(true);
    }
  });
}


initializeSelect();
enableAvatarClickToCopy();
initializePopupMessaging();


watchContentUpdate(status => {
  const { haveRepliesChange, hasTextareaReset } = status;

  if (haveRepliesChange && !hasTextareaReset) {
    enableAvatarClickToCopy();
    getSelect().value = 'Prompts...';
  }
  if (hasTextareaReset) {
    initializeSelect();
  }
});
