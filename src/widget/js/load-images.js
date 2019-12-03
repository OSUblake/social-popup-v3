const extPattern = /\.([0-9a-z]+)(?:[\?#]|$)/i;

const videoExtensions = "3gp,mpg,mpeg,mp4,m4v,m4p,ogv,ogg,mov,webm".split(",");

export default function(panels) {

  const promises = panels.reduce((res, panel) => {

    if (panel.icon) {
      res.push(loadImage(panel, "icon"));
    }
    
    if (panel.video) {
      
      res.push(loadVideo(panel, "video"));

    } else if (panel.image) {

      if (isVideo(panel.image)) {
        res.push(loadVideo(panel, "image"));
      } else {
        res.push(loadImage(panel, "image"));
      }
    }
    
    return res;
  }, []);

  return promises;
}

function loadImage(panel, prop) {
  return new Promise((resolve, reject) => {

    const image = new Image();
    image.onerror = fulfill;
    image.onload = fulfill;
    image.src = panel[prop];

    function fulfill(event) {

      image.onerror = undefined;
      image.onload = undefined;

      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || event.type === "error") {
        console.warn("Cannot load image", panel[prop]);
        panel[prop] = "";
      } else if (prop === "image") {
        panel.imageWidth = width;
        panel.imageHeight = height;
      }

      resolve(image);
    }
  });
}

function loadVideo(panel, prop) {
  return new Promise((resolve, reject) => {

    const video = document.createElement("video");
    video.onerror = fulfill;
    video.oncanplaythrough = fulfill;
    video.src = panel[prop];

    function fulfill(event) {

      video.onerror = undefined;
      video.oncanplaythrough = undefined;

      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;

      if (!width || event.type === "error" || !duration || !isFinite(duration)) {
        console.warn("Cannot load video", panel[prop]);
        panel[prop] = "";
      } else {
        panel.isVideo = true;
        panel.video = panel[prop];
        panel.imageWidth = width;
        panel.imageHeight = height;
        panel.videoDuration = duration;
      }

      resolve(video);
    }
  });
}

function isVideo(file) {

  const matches = file.match(extPattern);

  if (!matches.length || !matches[1]) {
    return false;
  }

  const extension = matches[1].toLowerCase();

  return videoExtensions.some(ext => ext === extension);
}
