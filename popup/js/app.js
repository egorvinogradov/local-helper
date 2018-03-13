/*
 * TODO: set emails accounts before using:
 *  1. Open developer console for popup.html
 *  2. Run __setAccounts(['your-account-1@gmail.com', 'your-account-2@gmail.com', ...])
 *  3. Ready to use
 */


function __setAccounts(emailArray){
  saveLocalValue('emails-all-accounts', emailArray);
}


function saveLocalValue(key, value) {
  localStorage.setItem('lh-' + key, JSON.stringify(value));
}


function getLocalValue(key){
  try {
    return JSON.parse(localStorage.getItem('lh-' + key));
  }
  catch (e) {
    return;
  }
}


function setInitialValues(){
  const prefix = getLocalValue('emails-prefix');
  const counter = getLocalValue('emails-counter');
  if (+counter) {
    $('#b-emails__counter').val(+counter);
  }
  $('#b-emails__prefix').val(prefix);
  initAccountsDropdown();
}


function copyToClipboard(value){
  var clipboard = $('#lh-clipboard');
  clipboard.val(value);
  clipboard.select();
  document.execCommand('copy');
}


function initAccountsDropdown(){
  const currentAccount = getLocalValue('emails-account');
  const allAccounts = getLocalValue('emails-all-accounts') || [currentAccount || 'Run __setAccounts()'];
  const html = allAccounts.map(email => {
    return `<a class="dropdown-item" href="#">${email}</a>`;
  }).join('\n');

  $('#b-emails__dropdown .dropdown-menu').html(html);
  $('#b-emails__dropdown .dropdown-toggle').text(currentAccount || allAccounts[0]);
}


function initEvents(){
  $('#b-emails__dropdown .dropdown-item').on('click', e => {
    let email  = $(e.currentTarget).text();
    $('#b-emails__dropdown .dropdown-toggle').text(email);
    saveLocalValue('emails-account', email);
  });

  $('#b-emails__prefix').on('keyup', e => {
    let prefix  = $(e.currentTarget).val();
    saveLocalValue('emails-prefix', prefix);
  });

  $('#b-emails__counter').on('keyup', e => {
    let counter  = $(e.currentTarget).val();
    saveLocalValue('emails-counter', counter);
  });

  $('#b-emails__copy').on('click', e => {
    const email = $('#b-emails__dropdown .dropdown-toggle').text();
    const prefix = $('#b-emails__prefix').val() || 'test';
    const counter = +$('#b-emails__counter').val() || 0;
    const testEmail = `${email.split('@')[0]}+${prefix}+${counter}@${email.split('@')[1]}`;

    setTimeout(() => {
      const newCounter = counter + 1;
      $('#b-emails__counter').val(newCounter);
      saveLocalValue('emails-counter', newCounter);
    }, 500);

    copyToClipboard(testEmail);
  });
}




// Init

setInitialValues();

if (getLocalValue('emails-all-accounts')) {
  initEvents();
}

setTimeout(() => {
  $('#b-emails__copy').focus();
}, 100);
