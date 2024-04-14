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


function parseChatPage(dom){
  let wau = 6666666;
  let usersOnline = 6666666;
  let messagesWeek = 6666666;

  try {
    const SKIP_TYPES = ['script', '.apexcharts-tooltip-text-y-label'];
    const wauEl = excludeBySelectors(getElementsByContent('WAU', dom), SKIP_TYPES)[0];
    wau = +wauEl?.parentElement.innerText.replace(/wau/i, '').trim() || 0;

    const usersOnlineEl = excludeBySelectors(getElementsByContent('участники онлайн', dom), SKIP_TYPES)[0];
    usersOnline = +usersOnlineEl?.parentElement.innerText.split(/\n/)[0].replace(/\s+/g, '') || 0;

    const messagesEl = excludeBySelectors(getElementsByContent('сообщения', dom), SKIP_TYPES)[0];

    if (messagesEl) {
      const messageWeekEl = getElementsByContent('за неделю', messagesEl.parentElement)[0];
      messagesWeek = +messageWeekEl?.parentElement.innerText.split(/\s/)[0] || 0;
    }
  }
  catch(e){
    window.__error = e;
    console.error(e);
  }

  return {
    wau,
    usersOnline,
    messagesWeek,
  };
}


function parseChannelPage(dom){
  if (!dom) {
    return null;
  }

  let errTotal = 6666666;
  let err24h = 6666666;
  let er = 6666666;
  let reach12 = 6666666;
  let reach24 = 6666666;
  let reach48 = 6666666;

  try {
    const SKIP_TYPES = ['script', '.apexcharts-tooltip-text-y-label'];

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

    reach12 = +reach12El?.parentElement.innerText.trim().split(/\t|\n/)[0] || 0;
    reach24 = +reach24El?.parentElement.innerText.trim().split(/\t|\n/)[0] || 0;
    reach48 = +reach48El?.parentElement.innerText.trim().split(/\t|\n/)[0] || 0;
  }
  catch(e){
    window.__error = e;
    console.error(e);
  }

  return {
    errTotal,
    err24h,
    er,
    reach12,
    reach24,
    reach48,
  };
}


function saveDataLocally(data){
  localStorage.setItem('TGStatsParser_' + data.handle, JSON.stringify(data));
}


function __parse(){
  const type = location.pathname.includes('/channel/') ? 'channel' : 'chat';
  const handleBase = location.pathname.split(/\/channel\/|\/chat\//)[1].split('/')[0];
  const handle = handleBase.startsWith('@') ? handleBase.replace(/^@/, '') : '+' + handleBase;

  let data = {};

  if (type === 'channel') {
    data = parseChannelPage(document);
  }
  else {
    data = parseChatPage(document);
  }
  data.handle = handle;
  data.tgStatLink = location.href;

  console.warn('TG STAT DATA', data);
  saveDataLocally(data);
}


__parse();
