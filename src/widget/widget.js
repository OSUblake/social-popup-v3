import { select, selectAll } from "./js/utils.js";
import html from "./js/html.js";
import loadFont from "./js/load-fonts.js";
import loadImages from "./js/load-images.js";
import loadScripts from "./js/load-scripts.js";
import settings from "./js/settings.js";

// (!) COMMENT THIS OUT BEFORE BUILD
import "./js/scrub-timeline.js";

const scriptPaths = [$_scripts_$];

let panels = settings.panels
  .filter(p => p.heading)
  .slice(0, settings.numPanels);

let megaPanels = settings.megaPanels
  .filter(p => p.heading && p.image)
  .slice(0, settings.numMegaPanels);

let allPanels = [...panels, ...megaPanels];

// const rootProps = gsap.getProperty("html");
const root = select("html");
const popupHolder = select(".popup-holder");
let popupContent, popupBackground;

Promise.all([
  loadFont(settings.headingFont, settings.subheadingFont),
  ...loadImages(allPanels),
  ...loadScripts(scriptPaths)
])
.then(res => buildWidget())
.catch(err => console.error("Failed to load assets", err));

function buildWidget() {

  if (!allPanels.length) {
    return;
  }
  
  const textBoxes = [];
  const icons = [];
  const images = [];

  allPanels.forEach(panel => {

    textBoxes.push(html`
      <div class="${panel.id} popup-text-box">
        <div class="popup-text-box__mask">
          <div class="popup-text-box__text">
            <div class="popup-text-box__heading">
              $${panel.heading}
            </div>
            <div></div>
            ${panel.subheading ? html`<div class="popup-text-box__subheading">$${panel.subheading}</div>` : ""}
          </div>
        </div>          
      </div>
    `);

    if (panel.icon) {

      icons.push(html`
        <div class="${panel.id} popup-icon">
          <div class="popup-icon__background"></div>
          <img class="popup-icon__image" src="${panel.icon}">
        </div>
      `);
    }

    if (panel.image) {

      images.push(html`
        <div class="${panel.id} popup-image">
          <div class="popup-image__background"></div>
          <img class="popup-image__image" src="${panel.image}">
        </div>
      `);
    }
  });

  popupHolder.innerHTML = html`
    <div class="popup-content">      
      <div class="popup-icons">${icons}</div>
      <div class="popup-images">${images}</div>
      <div class="popup-background"></div>      
      <div class="popup-text-boxes">${textBoxes}</div>
    </div>
  `;

  positionElements();
  buildAnimation();

  // requestAnimationFrame(() => {
  //   positionElements();
  //   buildAnimations();
  // });
}

function positionElements() {

  popupBackground = select(".popup-background");

  let maxWidth = -Infinity;

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";
  const startWidth = settings.textBoxWidth;
  const padX = settings.textBoxPadX;
  const padY = settings.textBoxPadY;
  const flipX = settings.flipX;
  const flipY = settings.flipY;

  const split = new SplitText(".popup-text-box__heading, .popup-text-box__subheading", {
    type: "chars"
  });
  
  allPanels.forEach(panel => {

    const icon = select(`.${panel.id}.popup-icon`);

    const image = select(`.${panel.id}.popup-image`);
    const imageElement = select(`.${panel.id} .popup-image__image`);

    const textBox = select(`.${panel.id}.popup-text-box`);
    const textBoxText = select(".popup-text-box__text", textBox);
    const textBoxMask = select(".popup-text-box__mask", textBox);
    const heading = select(".popup-text-box__heading", textBox);
    const headingChars = selectAll(".popup-text-box__heading > *", textBox);
    const subheading = select(".popup-text-box__subheading", textBox);
    const subheadingChars = selectAll(".popup-text-box__subheading > *", textBox);

    const textBounds = textBoxText.getBoundingClientRect();

    if (textBounds.height > settings.textBoxHeight) {

      const scale = (settings.textBoxHeight - settings.textBoxPadY * 2) / textBounds.height;
  
      gsap.set(textBoxText, { scale });
    }

    const headingWidth = heading.getBoundingClientRect().width;
    const subheadingWidth = subheading ? subheading.getBoundingClientRect().width : headingWidth;
    const textWidth = Math.max(headingWidth, subheadingWidth);

    let tempMaskWidth = textWidth + padX * 2;

    let textBoxWidth = startWidth;

    let hasOverflow = tempMaskWidth > textBoxWidth;

    // if (adjustWidth) {

    //   if (!hasOverflow) {
    //     textBoxWidth = tempMaskWidth;
    //   }
    // }

    if (adjustWidth && !hasOverflow) {
      textBoxWidth = tempMaskWidth;
    }

    let maskWidth = textBoxWidth - padX * 2;
    let deltaX = startWidth - textBoxWidth;
    let maskX = adjustWidth && flipX ? padX + deltaX : padX;
    // let maskX = padX;

    if (textBoxWidth > maxWidth) {
      maxWidth = textBoxWidth;
    }

    gsap.set(textBoxMask, {
      width: maskWidth,
      x: maskX
    });

    panel.iconX = -deltaX;
    panel.bgScale = textBoxWidth / startWidth;

    panel.headingOverlow = Math.max(0, headingWidth - maskWidth);
    panel.subheadingOverlow = Math.max(0, subheadingWidth - maskWidth);

    console.log("\n");
    console.log("HEADING OVERFLOW", panel.headingOverlow)
    console.log("SUBHEADING OVERFLOW", panel.subheadingOverlow)

    panel.targets = {
      icon, image, imageElement, textBox, textBoxText, textBoxMask, heading, headingChars, subheading, subheadingChars
    };
  });

  const firstPanel = allPanels[0];

  gsap.set(firstPanel.targets.icon, {
    x: firstPanel.iconX
  });

  gsap.set(popupBackground, {
    scaleX: firstPanel.bgScale
  });

  gsap.set(".popup-text-box__text", {
    yPercent: -50
  });

  if (flipX) {

    gsap.set(popupHolder, {
      rotationY: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationY: 180
    });
  }

  if (flipY) {

    gsap.set(popupHolder, {
      rotationX: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationX: 180
    });
  }
}

function buildAnimation() {
  
  gsap.to(popupHolder, {
    duration: 0.1,
    autoAlpha: 1
  });
}
