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
  'latin',
  'latam',
  'asia',
  'emea',
  'apac',
  'america',
  'americas',
  'american',

  // Location
  'remote',
  'timezone',
  'office',
  'hybrid',
  'travel',
  'trip',
  'based',
  'location',
  'locations',
  'global',
  'region',
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
      z-index: 100000;
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
    z-index: 100000;
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
    'jobs.lever.co'
  ];
  if (jobBoards.includes(location.hostname)) {
    return true;
  }
  else if (/\/(career|job|vacanc|position)/i.test(location.pathname)) {
    return true;
  }
  else if (/^(career|job|vacanc|position)/i.test(location.hostname)) {
    return true;
  }
  return false;
}


if (isJobWebsite()) {
  renderRedirectToJobDescriptionButton();
  initializeSearch();
}
