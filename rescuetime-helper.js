const LINK_STYLE = `
  margin-left: 5px;
  font-size: 0.8em;
  border-left: 1px solid rgba(0,0,0,.1);
  padding-left: 6px;
`;

function getNewLinkElementsArray(){
  var selector = '.report-table a[href^="https://www.rescuetime.com/browse/activities/"]:not(.lh-patched)';
  return Array.prototype.slice.apply(document.querySelectorAll(selector));
}

function createElement(tagName, attributes) {
  var el = document.createElement(tagName);
  for (var key in attributes) {
    el[key] = attributes[key];
  }
  return el;
}

function createBrowserHistoryLinkElement(domain){
  var browserHistoryLinkElement = createElement('a', {
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
  linkElements.forEach(function(el){
    domain = el.innerText;
    insetAfter(el, createGoogleHistoryLinkElement(domain));
    insetAfter(el, createBrowserHistoryLinkElement(domain));
    insetAfter(el, createOpenLinkElement(domain));
    el.classList.add('lh-patched');
  });
}

function initializeNeutralItemsSwitch(){
  $('.report-table-meta .bulk-select-label').on('click', function(e){
    setTimeout(function(){
      $('#bulk-update-cancel-link').append(`
        | <a id="lh-show-neutral" href="#" style="color: #8b9695">show neutral only</a>
      `);
      toggleHidden();
      $('#lh-show-neutral').on('click', function(e){
        $('.report-table tr').filter(function(i, el){
          return !$(el).find('.productivity-link.score0').length;
        }).hide();
        e.preventDefault();
      });
    }, 1000);
  });
}


function toggleHidden(){
  $('tr.row-hidden').removeClass('row-hidden');
  $('#hidden-rows-toggle').hide();
}

function limitColumnWidth(){
  const css = `
  <style>
    .report-table-primary-field {
      max-width: 400px;
    }
  </style>
  `;
  $('head').append(css);
}


function appendCalcProductivityButton(){
  var button = $('<div><button id="calc_productivity">Calc productivity</button></div>')
    .find('button')
    .css({
      borderColor: '#41874d',
      padding: '2px 7px 4px 7px',
    })
    .end();
  $('.productivity-arc-comparison').append(button);
  $('#summary-info-panels .row .large-12.small-12.columns').css('paddingTop', '20px');
  button.on('click', function(){
    var params = getProductivityParams();
    var paramsArr = [];
    for (var key in params) {
      paramsArr.push(`${key}=${params[key]}`);
    }
    var url = `https://productivity-tool.surge.sh?${paramsArr.join('&')}`;
    window.open(url);
  });
}

function getProductivityParams(){
  var jsCode = $('#rtdata_json').html().replace('//<![CDATA[', '').replace('//]]>', '');
  eval(jsCode);

  var productive = RTDATA.chart_data.productivity_arc.filter(a => a.name === 'Productive')[0].duration / 60 / 60
    + RTDATA.chart_data.productivity_arc.filter(a => a.name === 'Very Productive')[0].duration / 60 / 60;

  var distracting = RTDATA.chart_data.productivity_arc.filter(a => a.name === 'Distracting')[0].duration / 60 / 60
    + RTDATA.chart_data.productivity_arc.filter(a => a.name === 'Very Distracting')[0].duration / 60 / 60;

  return {
    desiredProductivity: 70,
    currentProductiveHours: Math.floor(productive),
    currentProductiveMinutes: Math.floor((productive % 1) * 60),
    currentUnproductiveHours: Math.floor(distracting),
    currentUnproductiveMinutes: Math.floor((distracting % 1) * 60),
  };
}


function initialize(){
  patchNewsLinks(getNewLinkElementsArray());
  initializeNeutralItemsSwitch();
  limitColumnWidth();
  setInterval(function(){
    if (window.location.pathname.indexOf('/dashboard') === 0 && !$('#calc_productivity').length) {
      appendCalcProductivityButton();
    }
    if (window.location.pathname.indexOf('/browse/productivity') === 0) {
      var newlinks = getNewLinkElementsArray();
      if (newlinks.length) {
        patchNewsLinks(newlinks);
      }
    }
  }, 950);
}

initialize();
