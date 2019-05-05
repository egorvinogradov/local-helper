/**
 * Automatically reloads http://e.ggtimer.com/ when time is expired
 */

const mainInterval = setInterval(function() {
  var text = document.getElementById('progressText').innerText.toLowerCase();
  if (/time expired/i.test(text)) {
    clearInterval(mainInterval);
    setTimeout(function() {
      showPopup();
      location.reload();
    }, 3000);
  }
}, 1000);


function showPopup(){
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
    <h2>Time's up</h2>
    </body>
  </html>
  `;
  const popupWidth = 600;
  const popupHeight = 350;
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
