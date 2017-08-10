/**
 * Parses general Linkedin profile data and generates a string to fill out Google Spreadsheets row
 * Usage from Chrome JS console:
 * 
 * Copy Google Spreadsheets value string:
 * o()
 * 
 * Copy profile name:
 * p()
 *
 */



var isInitialized = false;


function init(){
  if (!isInitialized) {
    expandContacts();
    window.profile = parseProfile();
    window.spreadsheetString = generateSpreadsheetString(profile);
    isInitialized = true;
  }
};


// Copy photo
function i(){
  init();
  copy(getProfilePictureCode());
}


// Copy name link
function o(){
  init();
  copy(getProfileNameLinkCode());
}


// Copy spreadsheet data srting
function p(){
  init();
  copy(window.spreadsheetString);
}


function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return Array.prototype.filter.call(elements, function(element){
    return RegExp(text).test(element.textContent);
  });
}


function expandContacts(){
  document.querySelector('.contact-see-more-less').click();
}


function getContactValue(label){
  try {
    return contains('.pv-contact-info__header', label)[0].nextElementSibling.innerText.trim();
  }
  catch(e){
    return '';
  }
}


function parseProfile() {

  var profile = {
    name: '',
    company: '',
    linkedin: '',
    email: '',
    skype: '',
    phone: '',
  };

  profile.linkedin = location.href;
  profile.company = document.querySelector('.pv-top-card-section__company').innerText.trim();
  profile.name = document.querySelector('.pv-top-card-section__name').innerText.trim();  

  profile.email = getContactValue('Email');

  profile.skype = getContactValue('IM');
  if (profile.skype.indexOf('Skype') > -1) {
    profile.skype = profile.skype.split(' (')[0];
  }

  profile.phone = getContactValue('Phone');
  if (profile.phone) {
    profile.phone = profile.phone.split(/\s+\([^0-9]/)[0].replace('+', '').replace(/[\s\(\)\-]/g, '');
    profile.phone = profile.phone[0] + ' ' + profile.phone.slice(1, 4) + ' ' + profile.phone.slice(4);
  }

  return profile;
}


function generateSpreadsheetString(profile){
  return `M,${profile.company},,Not contacted yet,,,No Intro,${profile.email},${profile.phone},,${profile.linkedin},${profile.skype}`;
}


function getProfilePictureCode(){
  var url = document.querySelector('.pv-top-card-section__image').src;
  return `=image("${url}")`;
}


function getProfileNameLinkCode(){
  var url = location.href;
  var name = document.querySelector('.pv-top-card-section__name').innerText.trim();
  return `=HYPERLINK("${url}", "${name}")`;
}

