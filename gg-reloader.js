/**
 * Automatically reloads http://e.ggtimer.com/ when time is expired
 */

setInterval(function() {
  var text = document.getElementById('progressText').innerText.toLowerCase();
  if (text === 'time expired!' || text === 'time expired') {
    setTimeout(function() {
      location.reload();
    }, 3000);
  }
}, 1000);
