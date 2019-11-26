import { select, selectAll } from "./js/utils.js";
import html from "./js/html.js";
import loadFont from "./js/load-fonts.js";
import loadImages from "./js/load-images.js";
import loadScripts from "./js/load-scripts.js";
import settings from "./js/settings.js";

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
let popupContent, popupBackground, popupIcons;

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
  
  gsap.registerPlugin(SplitText);

  const textBoxes = [];
  const icons = [];
  const images = [];

  allPanels.forEach(panel => {

    // textBoxes.push(html`
    //   <div class="${panel.id} popup-text-box">
    //     <div class="popup-text-box__mask">
    //       <div class="popup-text-box__text">
    //         <div class="popup-text-box__heading">
    //           $${panel.heading}
    //         </div>
    //         <div></div>
    //         ${panel.subheading ? html`<div class="popup-text-box__subheading">$${panel.subheading}</div>` : ""}
    //       </div>
    //     </div>          
    //   </div>
    // `);

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
  createAnimation();
}

function positionElements() {

  popupBackground = select(".popup-background");
  popupContent = select(".popup-content");
  popupIcons = select(".popup-icons");

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";
  const startWidth = settings.textBoxWidth;
  const padX = settings.textBoxPadX;
  const padY = settings.textBoxPadY;
  const flipX = settings.flipX;
  const flipY = settings.flipY;

  const maxTextBoxHeight = (settings.textBoxHeight - padY * 2);

  const imageWidth = Math.min(settings.maxImageWidth, startWidth);
  const imageHeight = Math.min(settings.maxImageHeight, startWidth);

  const imageAlign = settings.imageAlign;
  let maxImageHeight = -Infinity;

  const headingSplit = new SplitText(".popup-text-box__heading", {
    type: "chars"
  });

  const subheadingSplit = new SplitText(".popup-text-box__subheading", {
    type: "chars"
  });
  
  // force repaint?
  // popupContent.style.display = "none";
  // popupContent.offsetHeight;
  // popupContent.style.display = "block";
  
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

    // (!) Absolute test
    const headingHeight = heading.getBoundingClientRect().height;
    const subheadingHeight = subheading ? subheading.getBoundingClientRect().height : 0;

    if (subheading) {
      gsap.set(subheading, {
        top: headingHeight
      });
    }

    gsap.set(textBoxText, {
      height: headingHeight + subheadingHeight
    });

    const textBounds = textBoxText.getBoundingClientRect();

    if (textBounds.height > maxTextBoxHeight) {

      panel.textScale = maxTextBoxHeight / textBounds.height;  
      gsap.set(textBoxText, { scale: panel.textScale });

    } else {
      panel.textScale = 1;      
    }

    const headingWidth = heading.getBoundingClientRect().width;
    const subheadingWidth = subheading ? subheading.getBoundingClientRect().width : headingWidth;
    const textWidth = Math.max(headingWidth, subheadingWidth);

    let textBoxWidth = startWidth;
    let tempMaskWidth = textWidth + padX * 2;

    if (imageElement) {

      const sx = imageWidth / panel.imageWidth;
      const sy = imageHeight / panel.imageHeight;

      const scale = Math.min(sx, sy);
      
      panel.imageWidth *= scale;
      panel.imageHeight *= scale;      

      if (adjustWidth) {
        textBoxWidth = Math.max(panel.imageWidth, textBoxWidth);
      }

      if (panel.imageWidth > tempMaskWidth) {
        tempMaskWidth = panel.imageWidth;
      }

      if (panel.imageHeight > maxImageHeight) {
        maxImageHeight = panel.imageHeight;
      }

      imageElement.style.width = panel.imageWidth + "px";
      imageElement.style.height = panel.imageHeight + "px";
    }

    // let tempMaskWidth = textWidth + padX * 2;
    // let textBoxWidth = startWidth;

    let hasOverflow = tempMaskWidth > textBoxWidth;

    if (adjustWidth && !hasOverflow) {
      textBoxWidth = tempMaskWidth;
    }   

    let maskWidth = textBoxWidth - padX * 2;
    let deltaX = startWidth - textBoxWidth;
    let maskX = adjustWidth && flipX ? padX + deltaX : padX;

    // if (textBoxWidth > maxWidth) {
    //   maxWidth = textBoxWidth;
    // }    

    panel.iconX = -deltaX;
    panel.bgScale = textBoxWidth / startWidth;
    panel.textBoxWidth = textBoxWidth;
    panel.hasOverflow = hasOverflow;
    panel.headingOverlow = Math.max(0, headingWidth - maskWidth);
    panel.subheadingOverlow = Math.max(0, subheadingWidth - maskWidth);

    // console.log("\n");
    // console.log("TEXT HEIGHT", textBounds.height)
    // console.log("HEADING OVERFLOW", panel.headingOverlow)
    // console.log("SUBHEADING OVERFLOW", panel.subheadingOverlow)

    panel.targets = {
      icon, image, imageElement, textBox, textBoxText, textBoxMask, heading, headingChars, subheading, subheadingChars
    };

    gsap.set(textBoxMask, {
      width: maskWidth,
      x: maskX
    });

    if (image) {

      let imageX = 0;
      let imagePercent = 0;

      switch (imageAlign) {
        case "left":          
          imageX = flipX ? textBoxWidth : 0;
          imagePercent = flipX ? -100 : 0;
          break;
        case "center":
          imageX = textBoxWidth / 2;
          imagePercent = -50;
          break;
        case "right":
          imageX = flipX ? 0 : textBoxWidth;
          imagePercent = flipX ? 0 : -100;
          break;
      }

      gsap.set(image, {
        x: imageX,
        xPercent: imagePercent
      });
    }
  });

  const firstPanel = allPanels[0];

  gsap.set(popupIcons, {
    x: firstPanel.iconX
  });

  gsap.set(popupBackground, {
    scaleX: firstPanel.bgScale
  });

  gsap.set(".popup-icon", {
    xPercent: -100
  });

  gsap.set(".popup-images", {
    height: maxImageHeight * 2,
    yPercent: -100
  });

  gsap.set(".popup-image", {
    y: maxImageHeight * 2,
    // yPercent: -100
  });

  gsap.set(".popup-text-box__text", {
    yPercent: -50
  });

  gsap.set(".popup-text-box__heading", {
    y: "+=15",
    // y: -100,
  });

  gsap.set(headingSplit.chars, {
    opacity: 0,
    yPercent: 25
  });

  gsap.set(subheadingSplit.chars, {
    opacity: 0
  });

  gsap.set(popupHolder, {
    height: settings.textBoxHeight + maxImageHeight * 2
  });

  gsap.set(".popup-icon, .popup-image, .popup-text-box__heading, .popup-text-box__subheading", {
    autoAlpha: 0
  });

  gsap.set(popupContent, {
    top: maxImageHeight * 2,
    xPercent: -100
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

function createAnimation() {

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";
  const textBoxHeight = settings.textBoxHeight;
  const overflowSpeed = settings.overflowSpeed;
  const minOverflowDuration = settings.minOverflowDuration;


  const firstPanel = allPanels[0];
  const lastPanel = allPanels[allPanels.length - 1];
  const wait = `+=${settings.showDuration}`;

  let prevHeight = 0;
  let prevPanel = null;
  let prevIcon = null;
  let prevImage = null;
  let prevHeading = null;
  let prevSubheading = null;
  let prevTextBoxMask = null;
  
  const master = gsap.timeline({
    // repeat: -1,
    // repeatDelay: settings.replayWait
  });

  const peakTime = 0.301725; // x-axis
  const peakProgress = 0.371944; // y-axis

  CustomEase.create("easeIn", "0.549, 0, 0.757, 0.460");
  CustomEase.create("easeOut", "0.149, 0.453, 0.329, 1");
  CustomEase.create("easeInOut", "M0,0C0.16564702500000003,0,0.228405825,0.17109424,0.301725,0.371944,0.405767975,0.656453368,0.5314574750000001,1,1,1");

  gsap.defaults({
    ease: "easeOut",
    duration: 0.25
  });  

  master.set(popupHolder, { autoAlpha: 1 })
    .to(popupContent, {
      duration: 0.5,
      xPercent: 0
    });


  allPanels.forEach(panel => {

    const { 
      icon, image, imageElement, textBox, textBoxText, textBoxMask, heading, headingChars, subheading, subheadingChars 
    } = panel.targets;

    const tl = gsap.timeline();
    const headingTl = gsap.timeline();
    const subheadingTl = gsap.timeline();

    // let headingDuration = 0;
    // let subheadingDuration = 0;

    tl.add("start")

    if (prevHeading) {
      
      tl.to(prevHeading, {
        duration: 0.25,
        // y: -textBoxHeight,
        y: `-=${textBoxHeight * 1.5 / panel.textScale}`,
        ease: "easeIn"
      }, "start")
      .set(prevHeading, {
        autoAlpha: 0
      }, ">");

    }

    if (prevSubheading) {

      // TODO: Add heading height?
      tl.to(prevSubheading, {
        duration: 0.25,
        // y: -textBoxHeight,
        y: `-=${textBoxHeight * 1.5 / panel.textScale}`,
        ease: "easeIn"
      }, "start+=0.125")
      .set(prevSubheading, {
        autoAlpha: 0
      }, ">");

    }

    tl.add("resize", prevHeading ? "-=0.2" : 0);

    if (adjustWidth && panel !== firstPanel) {

      tl.to(popupIcons, {
        duration: 1,
        x: panel.iconX,
        ease: "easeInOut"
      }, "resize")
      .to(popupBackground, {
        duration: 1,
        scaleX: panel.bgScale,
        ease: "easeInOut"
      }, "resize");

    }

    tl.add("text");

    headingTl.set(heading, {
      autoAlpha: 1
    })
    .to(heading, {
      duration: 0.25,
      y: 0
    }, 0)
    .to(headingChars, {
      duration: 0.25,
      opacity: 1,
      yPercent: 0,
      stagger: {
        each: 0.125,
        // amount: 0.5
      }
    }, 0);
    

    if (subheading) {

      subheadingTl.set(subheading, {
        autoAlpha: 1
      })
      .to(subheadingChars, {
        duration: 0.25,
        opacity: 1,
        stagger: {
          each: 0.125,
          // amount: 0.5
        }
      });

    }

    // const headingDuration = headingTl.duration();
    // const subheadingDuration = subheadingTl.duration();

    headingTl.duration(0.5);
    subheadingTl.duration(0.5);

    tl.add(headingTl, "resize+=0.5");
    tl.add(subheadingTl, "resize+=0.75");

    if (panel.headingOverlow) {

      tl.to(heading, {
        // duration: 1,
        // duration: panel.headingOverlow / overflowSpeed,
        duration: Math.max(minOverflowDuration, panel.headingOverlow / overflowSpeed),
        x: -panel.headingOverlow / panel.textScale,
        ease: "easeInOut"
      }, "resize+=1");
    }

    if (subheading && panel.subheadingOverlow) {

      tl.to(subheading, {
        // duration: 1,
        // duration: panel.subheadingOverlow / overflowSpeed,
        duration: Math.max(minOverflowDuration, panel.subheadingOverlow / overflowSpeed),
        x: -panel.subheadingOverlow / panel.textScale,
        ease: "easeInOut"
      }, "resize+=1.25");
    }
    
    if (icon) {

      tl.set(icon, {
        autoAlpha: 1
      })
      .to(icon, {
        duration: 0.5,
        xPercent: 0
      })
    }

    tl.set({}, {}, wait);

    master.add(tl, panel !== firstPanel ? ">" : "-=0.5");

    // prevTextBoxMask = textBoxMask;
    prevIcon = icon;
    prevImage = image;
    prevHeading = heading;
    prevSubheading = subheading;
    // prevPanel = panel;
  });

  if ($_devMode_$) {
    ScrubGSAPTimeline(master);
  }
}
