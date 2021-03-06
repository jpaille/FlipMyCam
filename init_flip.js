// This script is loaded when https://meet.google.com/* is accessed.

var my_video_id;
var page = "PREVIEW";
window.camIsFlipped = true

waitForElement('video').then(function(video) {
    // Flip the preview video before entering the room.
    flipVideo(video);
});

waitForElement('[data-allocation-index="0"]').then(function(element) {
    // data-allocation-index is used to identify the actual meeting room 
    // juste after a user press the button "go to meeting".
    page = "MEETING"
    setTimeout(function() { initFlip(); }, 500);
    // 2 seconds of delay to let google javascript to fully load the room page.
});

function initFlip() {
    // store my cam video id
    videos = document.querySelectorAll('video');
    main_video = videos[videos.length -1];
    my_video_id = main_video.parentElement.dataset['ssrc']
    // flip all my videos, there can be several stream of my cam on the room (thumbnail view on the top right corner))
    if (window.camIsFlipped) {
        flipVideos()
    }
    // For the future if a new video appears on the page:
    // If it's my cam and flip activated then flip this new video.
    startMutationObserver()
}

function checkVideos(video) {
    // check all is flipped in the right way
    // this is useful when people are screensharing several times.
    videos = document.querySelectorAll(`div[data-ssrc`);
    var i;
    for (i = 0; i < videos.length; i++) {
        if (videos[i].dataset['ssrc'] == my_video_id) {
	 if (window.camIsFlipped) {
	     videos[i].style.transform = 'ScaleX(-1)';
	 }
	 else {
	     videos[i].style.transform = 'ScaleX(1)';
	 }
        }
        else
        {
	 videos[i].style.transform = 'ScaleX(1)'
        }
    }
}

function flipVideo(video) {
    div = video.closest('div');
    div.style.transform = 'ScaleX(-1)';
}

function flipVideos() {
    if (page == "PREVIEW") {
        videos = document.querySelectorAll(`video`);
    }
    else if (page == "MEETING") {
        videos = document.querySelectorAll(`div[data-ssrc="${my_video_id}"]`);
    }
    videos.forEach(flipVideo);
}

function unflipVideo(video) {
    div = video.closest('div');
    div.style.transform = 'ScaleX(1)';
}

function unflipVideos() {
    if (page == "PREVIEW") {
        videos = document.querySelectorAll(`video`);
    }
    else if (page == "MEETING") {
        videos = document.querySelectorAll(`div[data-ssrc="${my_video_id}"]`);
    }
    videos.forEach(unflipVideo);
}

function waitForElement(selector) {
  return new Promise(function(resolve, reject) {
    var element = document.querySelector(selector);

    if(element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for(var node of nodes) {
          if(node.matches && node.matches(selector)) {
            observer.disconnect();
            resolve(node);
            return;
          }
        };
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

function flipIfMyVideoAndFlipActivated(video)
{
    if (video.parentElement.dataset["ssrc"] == my_video_id && window.camIsFlipped )
    {
        flipVideo(video);
    }
    else {
        unflipVideo(video); // handle strange case of people starting screensharing after the meeting has started.
    }
    checkVideos()
}

function startMutationObserver() {
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).filter(function(addedNode) {
	     return addedNode.nodeName == 'VIDEO' }).forEach(function(addedNode) {
                   setTimeout(function() { flipIfMyVideoAndFlipActivated(addedNode); }, 500); 
            });
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});
}
