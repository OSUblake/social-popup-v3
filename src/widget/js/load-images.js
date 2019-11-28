export default function(panels) {

  const promises = panels.reduce((res, panel) => {
    if (panel.icon) {
      res.push(loadImage(panel, "icon"));
    }
    
    if (panel.image) {
      res.push(loadImage(panel, "image"));
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

      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

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
