function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const [cookieName, cookieValue] = cookies[i].split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
}

function sendRequest(apiPath, data, method){
  const token = getCookie('csrf');

  return fetch('https://api.simplify.jobs' + apiPath, {
    method: method || 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Csrf-Token': token,
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Request success:', data);
    return data;
  })
  .catch(error => console.log('🛑 Request error:', error));
}

function createCompany(name){
  return sendRequest('/v2/company/', { name }).then(data => data.id);
}

function submitApplication(jobTitle, companyId){
  return sendRequest('/v2/candidate/me/application/', {
    company_id: companyId,
    job_title: jobTitle,
    location: 'Remote',
    job_type: 2,
    resume_id: '3f96d9cf-0283-40ec-ad32-a1a1376bf821',
  });
}

function addNotesToApplication(application, notes){
  return sendRequest('/v2/candidate/me/application/' + application.id, {
    date_applied: application.date_applied,
    status: application.status,
    status_date: application.status_date,
    notes,
  }, 'PUT');
}

function addJob(jobTitle, companyName, notes){
  return createCompany(companyName).then(companyId => {
    return submitApplication(jobTitle, companyId).then(application => {
      return addNotesToApplication(application, notes).then(updatedApplication => {
        console.log('Created application:', updatedApplication);
        window.__application = updatedApplication;
      });
    });
  });
}

function createInputPane() {
  const container = document.createElement('div');
  container.classList.add('local-helper-pane');
  container.innerHTML = `
    <textarea class="local-helper-pane-textarea" placeholder="Application data"></textarea>
    <button class="local-helper-pane-button">Submit application</button>
  `;
  document.body.appendChild(container);

  const styles = document.createElement('style');
  styles.innerHTML = `
    .local-helper-pane {
      position: fixed;
      top: 0;
      right: 0;
      width: 38px;
      height: 38px;
      overflow: hidden;
      background: #3F86A1;
      border-bottom-left-radius: 2px;
    }
    .local-helper-pane:before {
      content: '⌘';
      color: #fff;
      width: 38px;
      line-height: 38px;
      text-align: center;
      display: block;
    }
    .local-helper-pane-textarea {
      display: block;
      opacity: 0;
      width: 100%;
      height: 125px;
    }
    .local-helper-pane-button {
       background: #3F86A1;
       color: #fff;
       font-weight: 500;
       padding: 6px 12px 7px 12px;
       margin-top: 14px;
       font-size: 14px;
       border-radius: 2px;
    }
    .local-helper-pane:hover,
    .local-helper-pane.m-submitting {
      width: 600px;
      height: auto;
      padding: 15px;
      background: #F3F4F6;
      border: 1px solid #E6E7EB;
    }
    .local-helper-pane:hover:before,
    .local-helper-pane.m-submitting:before {
      display: none;
    }    
    .local-helper-pane:hover .local-helper-pane-textarea,
    .local-helper-pane.m-submitting .local-helper-pane-textarea {
      opacity: 1;
    }
    .m-submitting .local-helper-pane-button {
      pointer-events: none;
      opacity: 0.5;
    }
    .m-success .local-helper-pane-button {
      background: #0cca6c;
    }
  `;
  document.head.appendChild(styles);

  requestAnimationFrame(() => {
    document.querySelector('.local-helper-pane-button').addEventListener('click', onInputPaneSubmit);
  });
}

function onInputPaneSubmit() {
  const paneElement = document.querySelector('.local-helper-pane');
  const textareaElement = document.querySelector('.local-helper-pane-textarea');

  const rows = textareaElement.value.trim().split(/\n/).filter(row => row.trim());
  const [ jobTitle, companyName, ...notes ] = rows;
  console.log('Submitting...', {
    jobTitle,
    companyName,
    notes,
    rows,
  });

  paneElement.classList.add('m-submitting');
  addJob(jobTitle, companyName, notes.join('\n\n'))
    .then(() => {
      paneElement.classList.add('m-success');
      setTimeout(() => { paneElement.classList.remove('m-success'); }, 1500);
      textareaElement.value = '';
    })
    .catch((e) => {
      alert('Error (see window.__error): ' + e.message);
      window.__error = e;
    })
    .finally(() => {
      paneElement.classList.remove('m-submitting');
    });
}

createInputPane();
