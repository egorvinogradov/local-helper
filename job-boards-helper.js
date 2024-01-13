const KEYWORDS_CASE_INSENSITIVE = [

  // Countries
  'canada',
  'germany',
  'netherlands',
  'sweden',
  'switzerland',
  'france',
  'spain',
  'israel',
  'ireland',
  'norway',
  'denmark',
  'finland',
  'belgium',
  'austria',
  'estonia',
  'poland',
  'czech',
  'ukraine',
  'portugal',
  'italy',
  'romania',
  'brazil',
  'mexico',
  'india',
  'china',
  'taiwan',

  // Regions
  'europe',
  'european',
  'latin',
  'latam',
  'asia',
  'asian',
  'emea',
  'apac',
  'america',
  'americas',
  'american',

  // Location
  'remote',
  'distributed',
  'timezone',
  'utc',
  'gmt',
  'office',
  'hybrid',
  'travel',
  'trip',
  'based',
  'located',
  'location',
  'locations',
  'global',
  'region',
  'regions',
  'everywhere',
  'anywhere',
  'world',
  'city',
  'country',
  'authorized',
  'authorization',
  'clearance',
  'resident',
  'residency',
  'visa',
  'permit',
  'permission',
  'legal',
  'legally',
  'outside',

  // Salary
  'range',
  'rate',
  'wage',
  'salary',
  'expectation',
  'expectations',
  'pay',
  'compensation',
  'equity',
  'shares',
  'stock',
  'options',
];

const KEYWORDS_CASE_SENSITIVE = [
  'US',
  'USA',
  'UK',
  'EU',
];

const KEYWORDS_PARTIAL = [
  '$',
  '€',
  'usd',
  'eur',
  'U.S.',
  'E.U.',
  'time zone',
  'united states',
  'united kingdom',
];


function searchKeywords(list, options) {
  return list.filter(keyword => {
    return findSingleKeyword(keyword, options);
  });
}

function findSingleKeyword(keyword, options) {
  const { isCaseSensitive, isPartialMatch } = options || {};
  return window.find(keyword, isCaseSensitive, false, true, !isPartialMatch, true, true);
}

function renderKeywordCounter(matches){
  let container = document.querySelector('#job-keywords');

  if (!container) {
    container = document.createElement('div');
    container.id = 'job-keywords';
    container.style = `
      font: normal normal 15px/27px 'Arial', sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000000;
      border: 1px solid red;
      color: red;
      padding: 0 8px;
      margin: 10px;
      background: white;
      user-select: none;
    `;
    document.body.appendChild(container);
    requestAnimationFrame(attachKeywordMatchClickEvents);
  }

  const matchesHTML = (matches || []).map(match => {
    return `<u data-match=${match} style="cursor: pointer">${preventWordFromBeingFound(match)}</u>`;
  });
  container.innerHTML = matches.length ? matchesHTML.join(', ') : 'No matches';
}


function attachKeywordMatchClickEvents(){
  document.querySelectorAll('#job-keywords > u').forEach((clickableWord) => {
    clickableWord.addEventListener('mousedown', e => {
      const { match } = e.target.dataset;
      const isCaseSensitive = KEYWORDS_CASE_SENSITIVE.includes(match);
      const isPartialMatch = KEYWORDS_PARTIAL.includes(match);
      findSingleKeyword(match, { isCaseSensitive, isPartialMatch });

      console.log('Searching for', match, {
        isCaseSensitive,
        isPartialMatch,
        totalMatches: window.TOTAL_MATCHES,
      });
    });
  });
}


function preventWordFromBeingFound(word){
  return word[0] + ' ' + word.slice(1);
}


function initializeSearch(){
  const caseInsensitiveMatches = searchKeywords(KEYWORDS_CASE_INSENSITIVE);
  const caseSensitiveMatches = searchKeywords(KEYWORDS_CASE_SENSITIVE, { isCaseSensitive: true });
  const partialWordMatches = searchKeywords(KEYWORDS_PARTIAL, { isPartialMatch: true });
  const totalMatches = [...caseInsensitiveMatches, ...caseSensitiveMatches, ...partialWordMatches];

  if (!totalMatches.length) {
    console.log('No matches found, retrying...');
    setTimeout(initializeSearch, 500);
  }
  else {
    console.log('Found matching keywords', totalMatches);
    window.TOTAL_MATCHES = totalMatches;
    renderKeywordCounter(totalMatches);
  }
}


function renderRedirectToJobDescriptionButton(){
  const descriptionPath = getJobDescriptionPath();
  const button = document.createElement('button');
  button.style = `
    font: normal normal 15px/27px 'Arial', sans-serif;
    position: fixed;
    top: 39px;
    left: 0;
    z-index: 10000000;
    border: 1px solid gray;
    color: gray;
    padding: 0 8px;
    margin: 10px;
    background: white;
    cursor: not-allowed;
  `;
  button.textContent = descriptionPath ? 'Open Job Description [↗]' : 'Job Description: N/A';
  document.body.appendChild(button);

  if (descriptionPath) {
    button.style.border = '1px solid red';
    button.style.color = 'red';
    button.style.cursor = 'pointer';

    button.addEventListener('click', () => {
      window.open(location.protocol + '//' + location.host + descriptionPath);
    });
  }
}


function getJobDescriptionPath(){
  const descriptionPaths = {
    'jobs.lever.co': () => location.pathname.split('/apply')[0],
    'apply.workable.com': () => location.pathname.split('/apply')[0],
    'jobs.ashbyhq.com': () => location.pathname.split('/application')[0],
    'jobs.jobvite.com': () => location.pathname.split('/apply')[0],
    'boards.greenhouse.io': () => {
      if (location.pathname.includes('/jobs/')) {
        const jobPostingTitle = document.querySelector('meta[property="og:title"]')?.content;
        if (jobPostingTitle) {
          return location.pathname.split('/jobs/')[0]
            + '#:~:text='
            + encodeURIComponent(jobPostingTitle).replace(/-/ig, '%2D');
        }
      }
    },
  };

  if (descriptionPaths[location.hostname]) {
    const descriptionPath = descriptionPaths[location.hostname]();
    const isAlreadySeeingDescription = descriptionPath === location.pathname;
    return isAlreadySeeingDescription ? null : descriptionPath;
  }
}

function isJobWebsite(){
  const jobBoards = [
    'jobs.jobvite.com',
    'boards.greenhouse.io',
    'jobs.ashbyhq.com',
    'apply.workable.com',
    'jobs.lever.co',
    'recruitee.com',
    'weworkremotely.com/remote-jobs',
    'remoteok.com/remote-jobs/',
  ];
  const exclusionList = ['simplify.jobs'];
  if (exclusionList.find(host => location.href.includes(host))) {
    return false;
  }
  if (jobBoards.find(host => location.href.includes(host))) {
    return true;
  }
  else if (/\/(career|job|vacanc|position|life-at-|team)/i.test(location.pathname)) {
    return true;
  }
  else if (/^(career|job|vacanc|position)/i.test(location.hostname)) {
    return true;
  }
  return false;
}


function shouldInitializeKeywordSearch(callback) {
  const isGreenhouseRootPage = location.hostname === 'boards.greenhouse.io'
    && location.pathname.split('/').filter((chunk) => chunk).length === 1;

  if (!isGreenhouseRootPage) {
    callback();
  }
}


function removeRedundantKeywordsFromDOM() {
  const rulesByWebsite = {
    'www.workingnomads.com': () => {
      const footer = document.getElementById('page-footer');
      footer.parentElement.removeChild(footer);
    },
    'remoteok.com/remote-jobs/': () => {
      const selectors = [
        'footer',
        '.preload',
        '.backdrop',
        '.spinner',
        '.loading_spinner',
        '.infinity-scroll',
        '.matching_user_cards',
        '.td-related-jobs',
      ];
      document.querySelectorAll(selectors.join(',')).forEach(block => {
        block.parentElement.removeChild(block);
      });
      const style = document.createElement('style');
      style.innerHTML = `
        tr[data-url^="/remote-jobs/"]:not(.active),
        tr[data-url^="/remote-jobs/"]:not(.active) + .expand,
        tr[data-url^="/remote-jobs/"]:not(.active) + .expand + .divider {
          display: none;
        }
        .expandContents {
          margin-bottom: 1000px;
        }
      `;
      document.head.appendChild(style);
    },
  };
  const matchingRuleKey = Object.keys(rulesByWebsite).find(urlPattern => location.href.includes(urlPattern));
  if (matchingRuleKey) {
    rulesByWebsite[matchingRuleKey]();
  }
}



// 🛑🛑🛑 DISABLING FOR NOW

// if (isJobWebsite()) {
//   console.log('✅ Detected job website');
//   renderRedirectToJobDescriptionButton();
//   shouldInitializeKeywordSearch(() => {
//     console.log('✅ Initializing keyword search...');
//     removeRedundantKeywordsFromDOM();
//     initializeSearch();
//   });
// }
