/*

Temporarily disabled. To enable, add the following to "content_scripts" in manifest.json
{
  "js": ["chat-gpt-utils.js"],
  "matches": ["https://chat.openai.com/*"]
},

*/


window.__currentDropdownPrompt = '';
window.__currentRepliesNumber = 0;
window.__currentFirstReplyText = '';


function parseLocationSearch() {
  const params = {};
  const queryString = location.search.substring(1);
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && !value) {
        params[decodeURIComponent(key)] = true;
      }
      else {
        params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
      }
    });
  }
  return params;
}

function setTextareaFromGETParams() {
  const { copilot, prompt, translate } = parseLocationSearch();
  if (copilot) {
    const COPILOT_PROMPT = 'Complete this code:';
    setTextareaText(COPILOT_PROMPT + '\n\n' + copilot);
  }
  if (translate) {
    const TRANSLATION_PROMPT = 'Translate this text. Don\'t reformat links, keep them as they are.';
    setTextareaText(TRANSLATION_PROMPT + '\n\n' + translate);
  }
  else if (prompt) {
    setTextareaText(prompt);
  }
  if (copilot || prompt || translate) {
    waitUntilTabFullyLoaded(triggerSubmit);
  }
}

function saveToLocalStorage(key, value) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}

function getFromLocalStorage(key){
  try {
    return JSON.parse(localStorage.getItem('lh-' + key));
  }
  catch (e) {}
}

function watchContentUpdate(onUpdate){
  setInterval(() => {
    const status = checkIfPageUpdated();
    if (status.hasTextareaReset || status.haveRepliesChange) {
      onUpdate(status);
    }
  }, 500);
}

function checkIfPageUpdated(){
  const replies = document.querySelectorAll('.w-full.border-b');
  const firstReplyText = replies?.[0]?.textContent || '';

  const haveRepliesChange =
    replies.length !== window.__currentRepliesNumber ||
    firstReplyText !== window.__currentFirstReplyText;

  const hasTextareaReset = !getPromptDropdown();

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

function getPromptDropdown(){
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

function triggerSubmit() {
  document.querySelector('button[data-testid="send-button"]').click();
}


function onPromptDropdownChange(e){
  const textarea = getTextarea();
  const textareaText = excludePreviousPrompt(textarea.value, window.__currentDropdownPrompt);
  const prompt = e.target.value;
  window.__currentDropdownPrompt = prompt;

  const placeholderPrompt = document.querySelector('#local-helper-prompts option:first-child');
  if (prompt === placeholderPrompt.value) {
    window.__currentDropdownPrompt = '';
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


function initializePromptDropdown(){
  const prompts = getFromLocalStorage('chatgpt-prompts') || [];
  const promptDropdown = document.createElement('select');
  promptDropdown.id = 'local-helper-prompts';
  promptDropdown.addEventListener('change', onPromptDropdownChange);

  document.addEventListener('keydown', function(e) {
    if (e.metaKey && e.key === '0') { /* Cmd+0 */
      getPromptDropdown().focus();
    }
  });

  setDropdownPrompts(promptDropdown, prompts);
  addPromptDropdownCustomCSS();

  const textarea = getTextarea();
  const container = textarea?.parentElement;
  if (textarea && container) {
    container.insertBefore(promptDropdown, container.firstChild);
  }
}

function addPromptDropdownCustomCSS(){
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

function setDropdownPrompts(promptDropdown, prompts) {
  const options = ['Prompts...', ...prompts].map((prompt, i) => {
    return `<option value="${prompt}">
      ${i ? i + '.' : ''}
      ${prompt}
    </option>`;
  });
  promptDropdown.innerHTML = options.join('\n');
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
      setDropdownPrompts(getPromptDropdown(), prompts);
      sendResponse(true);
    }
  });
}

function waitUntilTabFullyLoaded(callback) {
  const interval = setInterval(() => {
    const tabElement = document.querySelector('[data-testid="gpt-4"]')
      || document.querySelector('[data-testid="text-davinci-002-render-sha"]');
    if (tabElement) {
      clearInterval(interval);
      callback();
    }
  }, 100);
}


setTextareaFromGETParams();
initializePromptDropdown();
enableAvatarClickToCopy();
initializePopupMessaging();


watchContentUpdate(status => {
  const { haveRepliesChange, hasTextareaReset } = status;

  if (haveRepliesChange && !hasTextareaReset) {
    enableAvatarClickToCopy();
    getPromptDropdown().value = 'Prompts...';
  }
  if (hasTextareaReset) {
    initializePromptDropdown();
  }
});
