import { escapeHtml, select, selectAll } from "./js/utils.js";
import loadFont from "./js/load-fonts.js";
import loadImages from "./js/load-images.js";
import loadScripts from "./js/load-scripts.js";
import settings from "./js/settings.js";

$_eventTarget_$.addEventListener("$_loadEvent_$", event => {
  // console.log("loaded");
});


const scriptPaths = [$_scripts_$];

let panels = settings.panels
  .filter(p => p.heading)
  .slice(0, settings.numPanels);

let megaPanels = settings.megaPanels
  .filter(p => p.heading && p.image)
  .slice(0, settings.numMegaPanels);

let allPanels = [...panels, ...megaPanels];

const popupHolder = select(".popup-holder");

Promise.all([
  loadFont(settings.headingFont, settings.subheadingFont),
  ...loadImages(allPanels),
  ...loadScripts(scriptPaths)
])
.then(res => buildWidget())
.catch(err => console.error("Failed to load assets"));

function buildWidget() {

  // console.log("STANDARD", panels);
  // console.log("MEGA", megaPanels);

  

  const html = /*html*/`
    <div class="popup-container">
      <div class="popup-background fill"></div>
      <h1>Hello</h1>
    </div>
  `;

  popupHolder.innerHTML = html;

  gsap.to(popupHolder, {
    duration: 0.1,
    autoAlpha: 1
  });

}
