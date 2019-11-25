export default (paths) => paths.map(path => loadScript(path));

function loadScript(src) {
  return new Promise((resolve, reject) => {

    const script = document.createElement("script");
    document.head.appendChild(script);

    script.onerror = reject;
    script.onload = fulfill;
    script.src = src;

    function fulfill(event) {
      script.onload = undefined;
      script.onerror = undefined;
      resolve(script);
    }
  });
}
