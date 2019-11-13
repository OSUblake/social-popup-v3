import { escapeHtml, select, selectAll } from "./js/utils.js";
import loadFont from "./js/load-fonts.js";
import loadImages from "./js/load-images.js";
import loadScripts from "./js/load-scripts.js";
import settings from "./js/settings.js";

$_eventTarget_$.addEventListener("$_loadEvent_$", event => {
  // console.log("loaded");
});

const scriptPaths = [
  "../vendor/gsap.min.js",
  "../vendor/SplitText.min.js"
];

let panels = settings.panels.filter(p => p.heading).slice(0, settings.numPanels);
let megaPanels = settings.megaPanels.filter(p => p.heading && p.image).slice(0, settings.numMegaPanels);
let allPanels = [...panels, ...megaPanels];

const container = select(".social-popup-container");

Promise.all([
  loadFont(settings.headingFont, settings.subheadingFont),
  ...loadImages(allPanels),
  ...loadScripts(scriptPaths)
])
.then(res => buildWidget())
.catch(err => console.error("Failed to load assets"));

function buildWidget() {
  gsap.to(container, {
    duration: 0.1,
    autoAlpha: 1
  });
}
