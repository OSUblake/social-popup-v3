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

const popupHolder = select(".popup-holder");

Promise.all([
  loadFont(settings.headingFont, settings.subheadingFont),
  ...loadImages(allPanels),
  ...loadScripts(scriptPaths)
])
.then(res => buildWidget())
.catch(err => console.error("Failed to load assets", err));

function buildWidget() {
  
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

  // var split = new SplitText(".popup-text-box__heading, .popup-text-box__subheading", {
  //   type: "chars"
  // });

  // var text1 = select(".popup-text-box__text");
  // var rect = text1.getBoundingClientRect();

  // if (rect.height > settings.textBoxHeight) {
  //   var scale = (settings.textBoxHeight - settings.textBoxPadY * 2) / rect.height;

  //   gsap.set(text1, {
  //     scale
  //   })
  // }

  // gsap.set(".popup-text-box__mask", {
  //   x: settings.textBoxPadX
  // })

  gsap.set(".popup-text-box__text", {
    yPercent: -50
  });

  if (settings.flipX) {

    gsap.set(popupHolder, {
      rotationY: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationY: 180
    });
  }

  if (settings.flipY) {

    gsap.set(popupHolder, {
      rotationX: 180
    });

    gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationX: 180
    });
  }

  gsap.to(popupHolder, {
    duration: 0.1,
    autoAlpha: 1
  });
}

function positionElements() {

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";
  const startWidth = settings.textBoxWidth;
  const padX = settings.textBoxPadX;
  const padY = settings.textBoxPadY;

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

    if (adjustWidth) {

      // textBoxWidth = Math.min(textBoxWidth, maskWidth);

      if (!hasOverflow) {
        textBoxWidth = tempMaskWidth;
      }
    }

    let maskWidth = textBoxWidth - padX * 2;
    let deltaX = startWidth - textBoxWidth;
    let maskX = adjustWidth ? padX + deltaX : padX;

    gsap.set(textBoxMask, {
      width: maskWidth,
      x: maskX
    })

    console.log("\n")
    // console.log("SUBHEADING", subheading)
    // console.log("heading", headingChars)
    // console.log("subheading", subheadingChars)

    panel.targets = {
      icon, image, imageElement, textBox, textBoxText, textBoxMask, heading, headingChars, subheading, subheadingChars
    };
  });





}

function _buildWidget() {

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

        <!--<div class="panel2 popup-icon">
          <div class="popup-icon__background"></div>
          <img class="popup-icon__image" src="../assets/icon-1.png">
        </div>-->
      </div>

      <div class="popup-images">
        <div class="megaPanel1 popup-image">
          <div class="popup-image__background"></div>
          <img class="popup-image__image" src="../assets/image-1.jpg">
        </div>

        <div class="megaPanel2 popup-image">
          <div class="popup-image__background"></div>
          <img class="popup-image__image" src="../assets/image-3.png">
        </div>
      </div>

      <div class="popup-background"></div>
      
      <div class="popup-text-boxes">
        <div class="popup-text-box">
          <div class="popup-text-box__mask">
            <div class="popup-text-box__text">
              <div class="popup-text-box__heading">
                @NERDORDIELONGERNAME
              </div>
              <div class="popup-text-box__subheading">
                make sure to follow me on twitter!
              </div>
            </div>
          </div>          
        </div>

        <!--<div class="popup-text-box">
          <div class="popup-text-box__mask">
            <div class="popup-text-box__text">
              <div class="popup-text-box__heading">
                WHAT ARE YOU DOING SON?
              </div>
              <div class="popup-text-box__subheading">
                what the heck is going on here?
              </div>
            </div>
          </div>          
        </div>

        <div class="popup-text-box">
          <div class="popup-text-box__mask">
            <div class="popup-text-box__text">
              <div class="popup-text-box__heading">
                A single heading just to test some stuff out
              </div>
            </div>
          </div>          
        </div>-->


      </div>
    </div>
  `;

  var split = new SplitText(".popup-text-box__heading, .popup-text-box__subheading", {
    type: "chars"
  })

  var text1 = select(".popup-text-box__text");
  var rect = text1.getBoundingClientRect();

  if (rect.height > settings.textBoxHeight) {

    // var scale = settings.textBoxHeight / (rect.height + settings.textBoxPadY * 2);
    var scale = (settings.textBoxHeight - settings.textBoxPadY * 2) / rect.height;

    gsap.set(text1, {
      scale
    })
  }

  gsap.set(".popup-text-box__mask", {
    x: settings.textBoxPadX
  })

  gsap.set(".popup-text-box__text", {
    yPercent: -50
  });

  if (settings.flipX) {

    gsap.set(popupHolder, {
      rotationY: 180
    });

    // gsap.set(".popup-icon__image, .popup-image__image, .popup-text-boxes", {
      // gsap.set(".popup-icon__image, .popup-image__image, .popup-text-box__mask", {
      // gsap.set(".popup-icon__image, .popup-image__image, .popup-text-boxes", {
      // gsap.set(".popup-icon, .popup-image, .popup-text-boxes", {
      gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationY: 180
    });
  }

  if (settings.flipY) {

    gsap.set(popupHolder, {
      rotationX: 180
    });

    // gsap.set(".popup-icon__image, .popup-image__image, .popup-text-boxes", {
    // gsap.set(".popup-icon, .popup-image, .popup-text-boxes", {
    gsap.set(".popup-icon__image, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationX: 180
    });
  }

  gsap.to(popupHolder, {
    duration: 0.1,
    autoAlpha: 1
  });
}
