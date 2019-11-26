export default function(font1, font2) {
  
  const link = document.createElement("link");
  document.head.appendChild(link);
  
  const fontLink1 = font1.trim().replace(/\s+/g, "+");
  const fontLink2 = font2.trim().replace(/\s+/g, "+");

  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = `https://fonts.googleapis.com/css?family=${fontLink1}|${fontLink2}`;
  
  return [
    new FontFaceObserver(font1).load(),
    new FontFaceObserver(font2).load()
  ];
}
