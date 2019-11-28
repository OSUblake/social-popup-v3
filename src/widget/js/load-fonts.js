import settings from "./settings.js";

export default function(font1, font2) {
  return new Promise((resolve, reject) => {

    const link = document.createElement("link");
    document.head.appendChild(link);
    
    const weights = ":100,200,300,400,600,700,800,900";  
    const fontLink1 = font1.trim().replace(/\s+/g, "+") + weights;
    const fontLink2 = font2.trim().replace(/\s+/g, "+") + weights;
  
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `https://fonts.googleapis.com/css?family=${fontLink1}|${fontLink2}&display=swap`;

    Promise.all([
      new FontFaceObserver(font1).load(null, settings.fontTimeout),
      new FontFaceObserver(font2).load(null, settings.fontTimeout)
    ])
    .then(res => resolve())
    .catch(err => {
      console.warn("Font", err);
      resolve();
    });
  });
}
