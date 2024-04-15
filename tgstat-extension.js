const SKIP_TYPES = ['script', '.apexcharts-tooltip-text-y-label'];

function getElementsByContent(targetString, parent = document) {
  const allElements = parent.querySelectorAll('body *');
  const directlyContainingElements = [];
  allElements.forEach(el => {
    if (el.childNodes) {
      Array.from(el.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.includes(targetString)) {
          directlyContainingElements.push(el);
        }
      });
    }
  });
  return directlyContainingElements;
}


function excludeBySelectors(elements, selectors) {
  let filteredElements = Array.from(elements);
  selectors.forEach(selector => {
    filteredElements = filteredElements.filter(el => !el.matches(selector));
  });
  return filteredElements;
}


function parseNum(str){
  str = (str || '').replace(/\s+/g, '').trim();
  return str.endsWith('k')
    ? +str.replace(/k$/, '') * 1000
    : +str;
}


function parseChatPage(dom = document){
  let dau = 6666666;
  let wau = 6666666;
  let mau = 6666666;
  let usersOnline = 6666666;
  let messagesDay = 6666666;
  let messagesWeek = 6666666;
  let messagesMonth = 6666666;

  try {
    const wauEl = excludeBySelectors(getElementsByContent('WAU', dom), SKIP_TYPES)[0];
    wau = parseNum(wauEl?.parentElement.innerText.replace(/wau/i, '')) || 0;

    const mauEl = excludeBySelectors(getElementsByContent('MAU', dom), SKIP_TYPES)[0];
    mau = parseNum(mauEl?.parentElement?.parentElement.innerText.replace(/mau/i, '')) || 0;

    const dauEl = excludeBySelectors(getElementsByContent('DAU', dom), SKIP_TYPES)[0];
    dau = parseNum(dauEl?.parentElement?.parentElement.innerText.replace(/dau/i, '')) || 0;

    const usersOnlineEl = excludeBySelectors(getElementsByContent('участники онлайн', dom), SKIP_TYPES)[0];
    usersOnline = parseNum(usersOnlineEl?.parentElement.innerText.split(/\n/)[0]) || 0;

    const messagesEl = excludeBySelectors(getElementsByContent('сообщения', dom), SKIP_TYPES)[0];

    if (messagesEl) {
      const messageDayEl = getElementsByContent('вчера', messagesEl.parentElement)[0];
      messagesDay = parseNum(messageDayEl?.parentElement.innerText.split(/\s/)[0]) || 0;

      const messageWeekEl = getElementsByContent('за неделю', messagesEl.parentElement)[0];
      messagesWeek = parseNum(messageWeekEl?.parentElement.innerText.split(/\s/)[0]) || 0;

      const messageMonthEl = getElementsByContent('за месяц', messagesEl.parentElement)[0];
      messagesMonth = parseNum(messageMonthEl?.parentElement.innerText.split(/\s/)[0]) || 0;
    }
  }
  catch(e){
    window.__error = e;
    console.error(e);
  }

  return {
    wau,
    dau,
    mau,
    usersOnline,
    messagesDay,
    messagesWeek,
    messagesMonth,
  };
}


function parseChannelPage(dom = document){
  let errTotal = 6666666;
  let err24h = 6666666;
  let er = 6666666;
  let reach12 = 6666666;
  let reach24 = 6666666;
  let reach48 = 6666666;

  try {
    const errTotalEl = excludeBySelectors(getElementsByContent('подписчиков читают посты канала', dom), SKIP_TYPES)[0];
    errTotal = +errTotalEl?.parentElement.innerText.trim().split(/\n/)[0].replace('%', '') || 0;

    const err24hEl = excludeBySelectors(getElementsByContent('первые 24 часа', dom), SKIP_TYPES)[0];
    err24h = +err24hEl?.parentElement.innerText.trim().split(/\n/)[0].replace('%', '') || 0;

    const erEl = excludeBySelectors(getElementsByContent('подписчиков (ER)', dom), SKIP_TYPES)[0];
    er = +erEl?.parentElement.parentElement.innerText.trim().split(/\n/)[0].replace('%', '') || 0;

    const reachEl = excludeBySelectors(getElementsByContent('средний рекламный', dom), SKIP_TYPES)[0]?.parentElement?.parentElement;
    let reach12El;
    let reach24El;
    let reach48El;

    if (reachEl) {
      reach12El = getElementsByContent('12 часов', reachEl)[0];
      reach24El = getElementsByContent('24 часа', reachEl)[0];
      reach48El = getElementsByContent('48 часов', reachEl)[0];
    }

    reach12 = parseNum(reach12El?.parentElement.innerText.trim().split(/\t|\n/)[0]) || 0;
    reach24 = parseNum(reach24El?.parentElement.innerText.trim().split(/\t|\n/)[0]) || 0;
    reach48 = parseNum(reach48El?.parentElement.innerText.trim().split(/\t|\n/)[0]) || 0;
  }
  catch(e){
    window.__error = e;
    console.error(e);
  }

  return {
    errTotal: errTotal / 1,
    err24h: err24h / 1,
    er: er / 1,
    reach12,
    reach24,
    reach48,
  };
}


function saveDataLocally(data){
  localStorage.setItem('TGStatsParser_' + data.handle, JSON.stringify(data));
}


function __parse(){
  const type = location.pathname.includes('/channel/')
    ? 'channel'
    : location.pathname.includes('/chat/')
      ? 'chat'
      : null;

  if (!type) {
    return;
  }

  const handleBase = location.pathname.split(/\/channel\/|\/chat\//)[1].split('/')[0];
  const handle = handleBase.startsWith('@') ? handleBase.replace(/^@/, '') : '+' + handleBase;

  let data = {};

  if (type === 'channel') {
    data = parseChannelPage();
  }
  else {
    data = parseChatPage();
  }

  data.type = type;
  data.handle = handle;
  data.tgStatLink = location.href;

  console.warn('TG STAT DATA', data);
  saveDataLocally(data);
}


__parse();



/********************/

/*
 * EXTRACTING SAVED DATA
 */

function copyStringFallback(str) {
  const textArea = document.createElement('textarea');
  textArea.value = str;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.error('Unable to copy', err);
  }
  document.body.removeChild(textArea);
}


function extractStoredTGStats(tgUrlsRaw){
  const allStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('TGStatsParser_'));
  const hostKey = 'TGSTAT_' + location.hostname.replace(/\./g, '_').toUpperCase();

  const allStats = tgUrlsRaw
    .split(/\n/)
    .map(url => {
      const handle = url.replace('https://t.me/', '').replace(/\/$/, '');
      const storageKey = allStorageKeys.find(key => {
        return key.replace('TGStatsParser_', '').toLowerCase() === handle.toLowerCase();
      });

      let stats = null;
      try {
        stats = JSON.parse(localStorage.getItem(storageKey));
      }
      catch(e) {
        console.warn('TGStat Aggregation Error:', e);
      }
      return stats;
    });

  console.warn(hostKey, allStats);
  window[hostKey] = allStats;
  return allStats;
}


async function handleStoredTgStatsExtraction(){
  let tgUrls = '';
  let combinedStat = [];

  const clipboardText = await navigator.clipboard.readText();

  if (clipboardText.startsWith('https://t.me/')) {
    console.error('🛑 NO PREV TG STATS, URL ONLY', { TG_URLS: clipboardText });
    const currentTgStat = extractStoredTGStats(clipboardText);
    tgUrls = clipboardText;
    combinedStat = currentTgStat;
  }
  else if (clipboardText.startsWith('window.ALL_TGSTAT')) {
    eval(clipboardText);
    console.error('✅ HAS PREV TG STATS, COMBINING', { ALL_TGSTAT: window.ALL_TGSTAT, TG_URLS: window.TG_URLS });
    const currentTgStat = extractStoredTGStats(window.TG_URLS);
    tgUrls = window.TG_URLS;
    combinedStat = window.ALL_TGSTAT.map((item, index) => {
      if (item) {
        return item;
      }
      return currentTgStat[index] || null;
    });
  }
  else {
    alert(`Can't detect. Copy URL col from Airtable.`);
  }

  if (tgUrls && combinedStat.length) {
    window.TG_URLS = tgUrls;
    window.ALL_TGSTAT = combinedStat;
    localStorage.__ALL_TGSTAT = JSON.stringify(combinedStat);

    copyStringFallback(`window.ALL_TGSTAT = ${JSON.stringify(combinedStat)}; window.TG_URLS = \`${tgUrls}\``);

    const successMessage = `Success. ${combinedStat.filter(val => val).length} non-empty out of ${combinedStat.length}.`
    alert(successMessage);
  }
}


function copyTgStatsToAirtable(){
  let allStats = [];
  try {
    allStats = JSON.parse(localStorage.__ALL_TGSTAT);
  }
  catch(e){}
  if (!allStats.length) {
    alert(`Can't find localStorage.__ALL_TGSTAT`);
    return;
  }

  const airtableContent = allStats.map(row => {
    return [
      row.er,
      row.errTotal,
      row.err24h,
      row.reach12,
      row.reach24,
      row.reach48,
      row.dau,
      row.wau,
      row.mau,
      row.messagesDay,
      row.messagesWeek,
      row.messagesMonth,
      row.usersOnline,
    ]
    .map(cell => `"${cell}"`).join('\t');
  }).join('\n');
  copyStringFallback(airtableContent);
  alert('Copied Airtable content');
}


// Exposing functions to bookmarklet scope from extension scope
localStorage.__handleStoredTgStatsExtraction = handleStoredTgStatsExtraction.toString();
localStorage.__copyTgStatsToAirtable = copyTgStatsToAirtable.toString();
localStorage.__extractStoredTGStats = extractStoredTGStats.toString();
localStorage.__copyStringFallback = copyStringFallback.toString();








/* Bookmarklet code collect *

javascript:(() => {
  eval(localStorage.__handleStoredTgStatsExtraction);
  eval(localStorage.__extractStoredTGStats);
  eval(localStorage.__copyStringFallback);
  handleStoredTgStatsExtraction();
})();

*/


/* Bookmarklet code copy *

javascript:(() => {
  eval(localStorage.__copyTgStatsToAirtable);
  eval(localStorage.__copyStringFallback);
  copyTgStatsToAirtable();
})();

*/




