const LINK_STYLE = `
  margin-left: 5px;
  font-size: 0.8em;
  border-left: 1px solid rgba(0,0,0,.1);
  padding-left: 6px;
`;

const GLOBAL_CSS = `
  table.bulk-editing tr:hover {
    background: rgba(0,0,0,.1);
  }
  .report-table-primary-field {
    max-width: 400px;
  }
`;

  
function appendGlobalStyles(){
  document.body.appendChild(createElement('style', {
    innerHTML: GLOBAL_CSS
  }));
}


function getNewLinkElementsArray(){
  const selector = '.report-table a[href^="https://www.rescuetime.com/browse/activities/"]:not(.lh-patched)';
  return Array.prototype.slice.apply(document.querySelectorAll(selector));
}


function createElement(tagName, attributes) {
  const element = document.createElement(tagName);
  for (const key in attributes) {
    element[key] = attributes[key];
  }
  return element;
}


function createBrowserHistoryLinkElement(domain){
  const browserHistoryLinkElement = createElement('a', {
    target: '_blank',
    href: `chrome://history/?q=${domain}`,
    innerText: 'Browser',
    style: LINK_STYLE
  });
  browserHistoryLinkElement.addEventListener('click', function(e){
    chrome.runtime.sendMessage({action: 'openTab', url: e.currentTarget.href});
    e.preventDefault();
  });
  return browserHistoryLinkElement;
}


function createGoogleHistoryLinkElement(domain){
  return createElement('a', {
    target: '_blank',
    href: `https://myactivity.google.com/myactivity?q=%22${domain}%22`,
    innerText: 'Google',
    style: LINK_STYLE
  });
}


function createOpenLinkElement(domain){
  return createElement('a', {
    target: '_blank',
    href: `http://${domain}`,
    innerText: 'Open Website',
    style: LINK_STYLE + `margin-left: 12px; border: 0;`
  });
}


function insetAfter(referenceElement, newElement){
  referenceElement.nextSibling.parentNode.insertBefore(newElement, referenceElement.nextSibling);
}


function patchNewsLinks(linkElements){
  linkElements.forEach((element) => {
    const domain = element.innerText;
    element.href = element.href
      .replace(/by\/day\/for/, 'by/rank/for')
      .replace(/by\/hour\/for/, 'by/rank/for');
    insetAfter(element, createGoogleHistoryLinkElement(domain));
    insetAfter(element, createBrowserHistoryLinkElement(domain));
    insetAfter(element, createOpenLinkElement(domain));
    element.classList.add('lh-patched');
  });
}


function enableGoogleSearchLinks(){
  $('.report-table-primary-field').toArray().forEach(item => {
    const rawText = $(item).text().trim();
    let linkText;
    let linkUrl;
    let searchTerm;

    if (rawText.indexOf('- Google Search') > -1) {
      linkUrl = 'https://www.google.com/search?q=';
      linkText = 'Google Search';
      searchTerm = rawText.replace('- Google Search', '').replace('- Google Chrome', '').trim();
    }
    else if (rawText.indexOf('- Google Maps') > -1) {
      linkUrl = 'https://maps.google.com/maps?q=';
      linkText = 'Google Maps';
      searchTerm = rawText.replace('- Google Maps', '').replace('- Google Chrome', '').trim();
    }
    if (searchTerm) {
      $(item).html(`${searchTerm} - <a href="${linkUrl}${searchTerm}" target="_blank">${linkText}</a>`)
    }
  });
}


function initializeNeutralItemsSwitch(){
  $('.report-table-meta .bulk-select-label').on('click', () => {
    setTimeout(() => {
      $('#bulk-update-cancel-link').append(`
        | <a id="lh-show-neutral" href="#" style="color: #8b9695">show neutral only</a>
      `);
      toggleHidden();

      if (location.pathname.indexOf('activities/223') > -1) {
        enableGoogleSearchLinks();
      }

      $('#lh-show-neutral').on('click', function(e){
        $('.report-table tr').filter((i, element) => {
          return !$(element).find('.productivity-link.score0').length;
        }).hide();
        e.preventDefault();
      });
    }, 1500);
  });
}


function toggleHidden(){
  $('tr.row-hidden').removeClass('row-hidden');
  $('#hidden-rows-toggle').hide();
}

function appendCalcProductivityButton(){
  const button = $('<div><button id="calc_productivity">Calc productivity</button></div>')
    .find('button')
    .css({
      padding: '2px 7px 1px 7px',
      margin: '-2px 0 0 3px',
    })
    .end();

  $('.productivity-arc-comparison').append(button);
  $('#summary-info-panels .row .large-12.small-12.columns').css('paddingTop', '20px');

  button.on('click', function(){
    const params = getProductivityParams();
    const paramsArr = [];
    for (const key in params) {
      paramsArr.push(`${key}=${params[key]}`);
    }
    const url = `https://productivity-tool.surge.sh?${paramsArr.join('&')}`;
    window.open(url);
  });
}

function getProductivityParams(){
  const { productivity_arc } = extractRescueTimeChartData();

  const productive = productivity_arc.filter(a => a.name === 'Productive')[0].duration / 60 / 60
    + productivity_arc.filter(a => a.name === 'Very Productive')[0].duration / 60 / 60;

  const distracting = productivity_arc.filter(a => a.name === 'Distracting')[0].duration / 60 / 60
    + productivity_arc.filter(a => a.name === 'Very Distracting')[0].duration / 60 / 60;

  return {
    desiredProductivity: 70,
    currentProductiveHours: Math.floor(productive),
    currentProductiveMinutes: Math.floor((productive % 1) * 60),
    currentUnproductiveHours: Math.floor(distracting),
    currentUnproductiveMinutes: Math.floor((distracting % 1) * 60),
  };
}

function extractRescueTimeChartData() {
  const rawString = $('#rtdata_json')
    .html()
    .split('RTDATA.chart_data=')[1]
    .split(';RTDATA.')[0];
  return JSON.parse(rawString);
}


function initialize(){
  patchNewsLinks(getNewLinkElementsArray());
  initializeNeutralItemsSwitch();
  appendGlobalStyles();
  setInterval(() => {
    if (window.location.pathname.indexOf('/dashboard') === 0 && !$('#calc_productivity').length) {
      appendCalcProductivityButton();
    }
    if (window.location.pathname.indexOf('/browse/productivity') === 0) {
      const newLinks = getNewLinkElementsArray();
      if (newLinks.length) {
        patchNewsLinks(newLinks);
      }
    }
  }, 950);
}

initialize();
