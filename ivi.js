function getVideoIframe(){
  try {
    return $('#player-iframe')[0].contentWindow.document;
  }
  catch (e) {
    return null;
  }
}

function getVideoElement(){
  return $('#video', getVideoIframe())[0];
}

function onFKeyPress(e){
  if (e.which === 102 || e.which === 1072 /* English "F" or Russian "А" */) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      switchFullscreen();
    }
  }
}

function switchFullscreen(videoIframe){
  if (document.fullscreen) {
    document.exitFullscreen();
  }
  else {
    try {
      getVideoElement().requestFullscreen();
    }
    catch (e) {}
  }
}

function waitFor(isComplete, maxDelay, callback){
  var isExpired = false;

  setTimeout(() => {
    isExpired = true;
  }, maxDelay);

  var interval = setInterval(() => {
    if (isComplete() || isExpired) {
      clearInterval(interval);
      callback(isComplete());
      return;
    }
  }, 300);
}

function isVideoPlaying(){
  var videoElement = getVideoElement();
  return videoElement && !videoElement.paused;
}

function hideLoader(){
  $('.loader', getVideoIframe()).hide();
}

function init(){
  var videoIframe =  getVideoIframe();
  if (videoIframe) {
    $(document).on('keypress', onFKeyPress);
    $(videoIframe).on('keypress', onFKeyPress);

    waitFor(isVideoPlaying, 10000, () => {
      try {
        getVideoElement().pause();
        setTimeout(hideLoader, 1500);
      }
      catch (e) {}
    });
  }
}

setTimeout(init, 1000);
