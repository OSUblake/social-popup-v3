export default function(font1, font2) {
  return new Promise((resolve, reject) => {

    const link = document.createElement("link");
    document.head.appendChild(link);
    
    font1 = font1.trim().replace(/\s+/g, "+");
    font2 = font2.trim().replace(/\s+/g, "+");

    // allow to resolve on error
    link.onerror = fulfill;
    link.onload = fulfill;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css?family=${font1}|${font2}&display=swap`;

    function fulfill(event) {
      link.onload = undefined;
      link.onerror = undefined;
      resolve(link);
    }
  });
}
