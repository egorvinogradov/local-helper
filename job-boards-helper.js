const KEYWORDS_CASE_INSENSITIVE = [

  // Countries
  'united states',
  'canada',
  'united kingdom',
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
  'czech republic',
  'ukraine',
  'portugal',
  'italy',
  'romania',
  'brazil',
  'mexico',

  // Regions
  'europe',
  'latin',
  'latam',
  'asia',
  'emea',
  'america',
  'americas',
  'american',

  // Location
  'remote',
  'timezone',
  'time zone',
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
  'world',
  'city',
  
  // Salary
  'range',
  'rate',
  'wage',
  'salary',
  'expectation',
  '$',
  'usd',
  'eur',
  'pay',
  '€',
];

const KEYWORDS_CASE_SENSITIVE = [
  'US',
  'USA',
  'EU',
];


function searchKeywords(list, isCaseSensitive) {
  return list.filter(keyword => {
    return window.find(keyword, isCaseSensitive, false, true, true, true, true);
  });
}


function renderKeywordCounter(matches){
  let container = document.querySelector('#job-keywords');

  if (!container) {
    container = document.createElement('div');
    container.id = 'job-keywords';
    container.style = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100000;
      font-size: 15px;
      border: 1px solid red;
      color: red;
      line-height: 27px;
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
      window.find(match, isCaseSensitive, false, true, true, true, true);
      console.log('Searching for', match, isCaseSensitive, window.TOTAL_MATCHES);
    });
  });
}


function preventWordFromBeingFound(word){
  return word[0] + ' ' + word.slice(1);
}


function initializeSearch(){
  const caseInsensitiveMatches = searchKeywords(KEYWORDS_CASE_INSENSITIVE, false);
  const caseSensitiveMatches = searchKeywords(KEYWORDS_CASE_SENSITIVE, true);
  const totalMatches = [...caseInsensitiveMatches, ...caseSensitiveMatches];

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


function detectJobPosting(callback){
  const interval = setInterval(() => {
    const simplifyJobsContainer = document.querySelector('#simplifyJobsContainer');
    if (simplifyJobsContainer) {
      clearInterval(interval);
      callback();
    }
  }, 100);
}


function renderRedirectToJobDescriptionButton(){
  const descriptionPath = getJobDescriptionPath();
  const button = document.createElement('button');
  button.style = `
    position: fixed;
    top: 39px;
    left: 0;
    z-index: 100000;
    font-size: 15px;
    border: 1px solid gray;
    color: gray;
    line-height: 27px;
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
  };

  if (descriptionPaths[location.hostname]) {
    const descriptionPath = descriptionPaths[location.hostname]();
    const isAlreadySeeingDescription = descriptionPath === location.pathname;
    return isAlreadySeeingDescription ? null : descriptionPath;
  }
}


detectJobPosting(() => {
  console.log('Detected job posting');
  renderRedirectToJobDescriptionButton();
  initializeSearch();
});
