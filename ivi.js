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
    switchFullscreen();
  }
}

function switchFullscreen(videoIframe){
  if (document.fullscreen) {
    document.exitFullscreen();
  }
  else {
    getVideoElement().requestFullscreen();
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
      getVideoElement().pause();
      setTimeout(hideLoader, 1500);
    });
  }
}

setTimeout(init, 1000);
