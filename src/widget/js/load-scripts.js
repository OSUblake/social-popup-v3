export default (paths) => paths.map(path => loadScript(path));

function loadScript(src) {
  return new Promise((resolve, reject) => {

    const script = document.createElement("script");
    document.head.appendChild(script);

    script.onload = fulfill;
    script.onerror = fulfill;
    script.src = src;

    function fulfill(event) {

      script.onload = undefined;
      script.onerror = undefined;

      if (event.type === "error") {
        reject(script);
      } else {
        resolve(script);
      }
    }
  });
}
