/**
 * Parses general Linkedin profile data and generates a string to fill out Google Spreadsheets row
 * Usage from Chrome JS console:
 * 
 * 1. Parse profile and copy Google Spreadsheets value string:
 * _d = _parseLinkedinProfile(); copy(_d.spreadsheetValueString);
 * 
 * 2. Copy person name:
 * copy(_d.name);
 *
 */

function _parseLinkedinProfile() {
  var profile = {};

  profile.linkedin = location.href;

  profile.email = $('.pv-contact-info__header:contains("Email")').next().text().trim() || '';

  profile.skype = $('.pv-contact-info__header:contains("IM")').next().text().trim() || '';
  if (profile.skype.indexOf('Skype') > -1) {
    profile.skype = profile.skype.split(' (')[0];
  }

  profile.phone = $('.pv-contact-info__header:contains("Phone")').next().text().trim() || '';
  if (profile.phone) {
    profile.phone = profile.phone.split(' (')[0].replace('+', '').replace(/\s/g, '');
    profile.phone = profile.phone[0] + ' ' + profile.phone.slice(1, 4) + ' ' + profile.phone.slice(4);
  }

  profile.company = $('.pv-top-card-section__company').text().trim();

  profile.name = $('.pv-top-card-section__name').text().trim();

  profile.spreadsheetValueString = `M,${profile.company},,Not contacted yet,,,Friend,${profile.email},${profile.phone},,${profile.linkedin},${profile.skype}`;

  return profile;
}
