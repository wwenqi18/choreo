let player
let url

// This code loads the IFrame Player API code asynchronously.
var YTdeferred = $.Deferred();
window.onYouTubeIframeAPIReady = function () {
  YTdeferred.resolve(window.YT)
}

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
$(document).ready(function () {
  // var player;

  YTdeferred.done(function (YT) {
    createPlayer()

    $("#load-btn").click(function () {
      var videoID = $('#input-box').val().split("=").pop()
      player.loadVideoById(videoID)
    })

    const ENTER_KEY = 13;
    $("#input-box").keyup(function () {
      if (event.keyCode === ENTER_KEY) {
        var videoID = $('#input-box').val().split("=").pop()
        player.loadVideoById(videoID)
      }
    })

    function createPlayer() {
      // var urlParams = new URLSearchParams(window.location.search)
      // var url = urlParams.get('url')
      // if (url === null) {
      //   url = savedUrl.split('=').pop()
      // }
      // console.log(url)
      var videoID = url.split("=").pop()

      player = new YT.Player('player', {
        width: '440',
        videoId: videoID,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      // event.target.playVideo();
    }

    // The API calls this function when the player's state changes.
    // The function indicates that when playing a video (state=1),
    // the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
      setInterval(function () {
        let time = getCurrentTime()
        if (time in timeList && time !== currentTime) {
          let item = findListItem(time)
          goToDiagram1(item)
        }
      }, 1000);
    }
    function stopVideo() {
      player.stopVideo();
    }

    function getCurrentTime() {
      var div = $('#current-time');
      var time = player.getCurrentTime();
      var convertedTime = convertTime(time)
      let formattedTime = convertedTime['hour'] + ":" + convertedTime['minute'] + ":" + convertedTime['second']
      div.html(formattedTime)
      return formattedTime
    }

    function convertTime(time) {
      var sec_num = parseInt(time, 10);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);
      if (hours < 10)
        hours = '0' + hours;
      if (minutes < 10)
        minutes = '0' + minutes;
      if (seconds < 10)
        seconds = '0' + seconds;
      return { 'hour': hours, 'minute': minutes, 'second': seconds };
    }
  })
})