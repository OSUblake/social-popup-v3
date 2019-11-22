import { escapeHtml, select, selectAll } from "./js/utils.js";
import html from "./js/html.js";
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

  const textBoxes = [];
  const icons = [];
  const images = [];

  popupHolder.innerHTML = html`
    <div class="popup-content">
      
      <div class="popup-icons">
        <div class="panel1 popup-icon">
          <div class="popup-icon__background"></div>
          <img class="popup-icon__image" src="../assets/icon-5.png">
        </div>
      </div>

      <div class="popup-images">
        <div class="megaPanel1 popup-image">
          <div class="popup-image__background"></div>
          <img class="popup-image__image" src="../assets/image-3.png">
        </div>
      </div>

      <div class="popup-background"></div>
      
      <div class="popup-text-boxes">
        <div class="popup-text-box">
          Hello, world!
        </div>
      </div>
    </div>
  `;

  if (settings.flipX) {

    gsap.set(popupHolder, {
      rotationY: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-text-box", {
      rotationY: 180
    });
  }

  if (settings.flipY) {

    gsap.set(popupHolder, {
      rotationX: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-text-box", {
      rotationX: 180
    });
  }

  gsap.to(popupHolder, {
    duration: 0.1,
    autoAlpha: 1
  });
}
