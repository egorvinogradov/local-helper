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
  'global',
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
];


function searchKeywords(list, isCaseSensitive) {
  return list.filter(keyword => {
    return window.find(keyword, isCaseSensitive, false, true, true, true, true);
  });
}


function renderKeywordCounter(matches){
  const counter = document.createElement('div');
  const matchesHTML = (matches || []).map(match => {
    return `<u style="cursor: pointer" data-match=${match}>${preventWordFromBeingFound(match)}</u>`;
  });
  counter.innerHTML = matches.length ? matchesHTML.join(', ') : 'No matches';
  counter.id = 'job-keywords';
  counter.style = `
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
  document.body.appendChild(counter);
  requestAnimationFrame(attachKeywordMatchClickEvents);
}


function attachKeywordMatchClickEvents(){
  document.querySelectorAll('#job-keywords > u').forEach((clickableWord) => {
    clickableWord.addEventListener('mousedown', e => {
      const { match } = e.target.dataset;
      const isCaseSensitive = KEYWORDS_CASE_SENSITIVE.includes(match);
      window.find(match, isCaseSensitive, false, true, true, true, true);
      console.warn('Searching for', match, isCaseSensitive, window.TOTAL_MATCHES);
    });
  });
}


function preventWordFromBeingFound(word){
  return word[0] + ' ' + word.slice(1);
}


function initializeNewSearch(){
  const caseInsensitiveMatches = searchKeywords(KEYWORDS_CASE_INSENSITIVE, false);
  const caseSensitiveMatches = searchKeywords(KEYWORDS_CASE_SENSITIVE, true);

  window.TOTAL_MATCHES = [...caseInsensitiveMatches, ...caseSensitiveMatches];
  renderKeywordCounter(window.TOTAL_MATCHES);
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
    border: 1px solid red;
    color: red;
    line-height: 27px;
    padding: 0 8px;
    margin: 10px;
    background: white;
  `;
  button.textContent = descriptionPath ? 'See Job Description' : 'No job description found';
  document.body.appendChild(button);

  if (descriptionPath) {
    button.addEventListener('click', () => {
      location.pathname = descriptionPath;
    });
  }
}


function getJobDescriptionPath(){
  const descriptionPaths = {
    lever: () => {
      return location.pathname.split('/apply')[0];
    },
  };
  if (location.hostname === 'jobs.lever.co') {
    return descriptionPaths.lever();
  }
}


detectJobPosting(() => {
  console.log('Detected job posting');
  initializeNewSearch();
  renderRedirectToJobDescriptionButton();
});
