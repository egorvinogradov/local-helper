/**
 * Automatically reloads http://e.ggtimer.com/ when time is expired
 */

function getPopupMessage() {
  const regex = /(\d+)\s*(h|hour|hours|m|min|mins|minutes|s|sec|seconds)/i;
  const match = location.pathname.replace(/^\//, '').match(regex);
  let normalizedDurationString = '';

  if (match) {
    const [, value, unit] = match;
    const lowerUnit = unit.toLowerCase();

    if (['h', 'hour', 'hours'].includes(lowerUnit)) {
      normalizedDurationString = `${value} hour${value > 1 ? 's are up' : ' is up'}`;
    } else if (['m', 'min', 'mins', 'minutes'].includes(lowerUnit)) {
      normalizedDurationString = `${value} minute${value > 1 ? 's are up' : ' is up'}`;
    } else if (['s', 'sec', 'seconds'].includes(lowerUnit)) {
      normalizedDurationString = `${value} second${value > 1 ? 's are up' : ' is up'}`;
    }
  }
  return normalizedDurationString || 'Time\'s up';
}


function watchTimer(onExpired) {
  const mainInterval = setInterval(() => {
    if (isExpired()) {
      clearInterval(mainInterval);
      onExpired();
    }
  }, 1000);
}

function isExpired() {
  const progressBar = document.getElementsByClassName('ClassicTimer-time')[0];
  return progressBar && /time expired/i.test(progressBar.innerText.toLowerCase());
}

function restartTimer() {
  document.querySelector('button[title="Restart timer"]').click();
}

function showPopup(){
  const popupMessage = getPopupMessage();
  const popupHTML = `<html>
    <body>
    <style>
      body {
        border: 10px solid #000;
        padding: 0;
        margin: 0;
      }
      h2 {
        font: normal 700 84px 'Helvetica Neue', Arial, sans-serif;
        letter-spacing: -0.02em;
        white-space: nowrap;
        transform: scaleY(1.05) translate(-50%, -50%);
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0;
      }
    </style>
    <h2>${popupMessage}</h2>
    </body>
  </html>
  `;
  const popupWidth = 980;
  const popupHeight = 390;
  const popupOptions = `
    toolbar=no,
    location=no,
    status=no,
    menubar=no,
    scrollbars=yes,
    resizable=yes,
    width=${popupWidth},
    height=${popupHeight},
    top=${(screen.height / 2) - (popupHeight / 2)}
    left=${(screen.width / 2) - (popupWidth / 2)}
  `;
  const popup = window.open('', 'popup', popupOptions);
  popup.document.write(popupHTML);
}

function initialize(){
  watchTimer(() => {
    showPopup();
    restartTimer();
    initialize();
  });
}

initialize();
