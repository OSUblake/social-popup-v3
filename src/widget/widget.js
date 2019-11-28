import { select, selectAll } from "./js/utils.js";
import html from "./js/html.js";
import loadFonts from "./js/load-fonts.js";
import loadImages from "./js/load-images.js";
import loadScripts from "./js/load-scripts.js";
import settings from "./js/settings.js";
import "../vendor/fontfaceobserver.js";

// (!) Comment out for build
// import "./js/scrub-timeline.js";

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
  loadFonts(settings.headingFont, settings.subheadingFont),
  ...loadImages(allPanels),
  ...loadScripts(scriptPaths)
])
.then(res => buildWidget())
.catch(err => console.error("Failed to load assets", err));

function buildWidget() {

  // filter mega panels again in case image failed
  megaPanels = megaPanels.filter(p => p.image);
  allPanels = [...panels, ...megaPanels];

  if (!allPanels.length) {
    return;
  }
  
  const textBoxes = [];
  const icons = [];
  const images = [];

  allPanels.forEach(panel => {

    // Use double $ signs to sanitize strings
    // $${'<div>Dangerous content</div>'}
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

  // add dummy elements to prevent warnings in console
  popupHolder.innerHTML = html`
    <div class="popup-content">      
      <div class="popup-icons">

        <div class="dummy popup-icon">
          <div class="popup-icon__background"></div>
          <img class="popup-icon__image" src="">
        </div>
        ${icons}
      </div>

      <div class="popup-images">

        <div class="dummy popup-image">
          <div class="popup-image__background"></div>
          <img class="popup-image__image" src="">
        </div>
        ${images}
      </div>

      <div class="popup-background"></div>      

      <div class="popup-text-boxes">        
        <div class="dummy popup-text-box">
          <div class="popup-text-box__mask">
            <div class="popup-text-box__text">
              <div class="popup-text-box__heading">i</div>
              <div class="popup-text-box__subheading">i</div>
            </div>
          </div>          
        </div>
        ${textBoxes}
      </div>
    </div>
  `;

  positionElements();
  createAnimation();
}

function positionElements() {

  gsap.config({
    nullTargetWarn: false
  });

  gsap.registerPlugin(SplitText);

  popupBackground = select(".popup-background");
  popupContent = select(".popup-content");
  popupIcons = select(".popup-icons");

  const {
    textBoxWidth: startWidth,
    widgetFlipX: flipX,
    widgetFlipY: flipY,
    headingOffset,
    padX,
    padY
  } = settings;

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";
  const alignment = settings.alignment.toLowerCase();
  const maxTextBoxHeight = (settings.textBoxHeight - padY * 2);
  const imageWidth = Math.min(settings.maxImageWidth, startWidth);
  const imageHeight = Math.min(settings.maxImageHeight, startWidth);
  const firstPanel = allPanels[0];

  const headingSplit = new SplitText(".popup-text-box__heading", {
    type: "chars"
  });

  const subheadingSplit = new SplitText(".popup-text-box__subheading", {
    type: "chars"
  });

  let maxImageHeight = 0;
    
  allPanels.forEach(panel => {

    const textBox = select(`.${panel.id}.popup-text-box`);
    const textBoxText = select(".popup-text-box__text", textBox);
    const textBoxMask = select(".popup-text-box__mask", textBox);
    const heading = select(".popup-text-box__heading", textBox);
    const headingChars = selectAll(".popup-text-box__heading > *", textBox);
    const subheading = select(".popup-text-box__subheading", textBox);
    const subheadingChars = selectAll(".popup-text-box__subheading > *", textBox);
    const icon = select(`.${panel.id}.popup-icon`);
    const iconElement = select(`.${panel.id} .popup-icon__image`);
    const image = select(`.${panel.id}.popup-image`);
    const imageElement = select(`.${panel.id} .popup-image__image`);

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

    const textHeight = textBoxText.getBoundingClientRect().height;

    if (textHeight > maxTextBoxHeight) {

      panel.textScale = maxTextBoxHeight / textHeight;  
      gsap.set(textBoxText, { scale: panel.textScale });

    } else {
      panel.textScale = 1;      
    }

    const headingBounds = heading.getBoundingClientRect();
    const headingWidth = headingBounds.width;
    const subheadingWidth = subheading ? subheading.getBoundingClientRect().width : headingWidth;
    const textWidth = Math.max(headingWidth, subheadingWidth);

    panel.headingHeight = headingBounds.height;

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

    let hasOverflow = tempMaskWidth > textBoxWidth;

    if (adjustWidth && !hasOverflow) {
      textBoxWidth = tempMaskWidth;
    }   

    let maskWidth = textBoxWidth - padX * 2;
    let deltaX = startWidth - textBoxWidth;
    let maskX = adjustWidth && flipX ? padX + deltaX : padX;

    panel.iconX = -deltaX;
    panel.bgScale = textBoxWidth / startWidth;
    panel.textBoxWidth = textBoxWidth;
    panel.hasOverflow = hasOverflow;
    panel.headingOverlow = Math.max(0, headingWidth - maskWidth);
    panel.subheadingOverlow = Math.max(0, subheadingWidth - maskWidth);

    panel.targets = {
      heading, 
      headingChars, 
      icon, 
      iconElement, 
      image, 
      imageElement, 
      subheading, 
      subheadingChars
    };

    gsap.set(textBoxMask, {
      width: maskWidth,
      x: maskX
    });

    if (image) {

      let imageX = 0;
      let imagePercent = 0;

      if (alignment === "left") {

        imageX = flipX ? textBoxWidth : 0;
        imagePercent = flipX ? -100 : 0;

      } else {

        imageX = flipX ? 0 : textBoxWidth;
        imagePercent = flipX ? 0 : -100;
      }

      gsap.set(image, {
        x: imageX,
        xPercent: imagePercent
      });
    }

    if (alignment === "right") {

      gsap.set(heading, {
        x: (maskWidth - headingWidth) + panel.headingOverlow
      });

      if (subheading) {

        gsap.set(subheading, {
          x: (maskWidth - subheadingWidth) + panel.subheadingOverlow
        });
      }
    }

    gsap.set(headingChars, {
      y: `+=${panel.headingHeight * headingOffset / panel.textScale}`
    });
  });

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
    y: maxImageHeight * 2
  });

  gsap.set(".popup-text-box__text", {
    yPercent: -50
  });

  gsap.set(headingSplit.chars, {
    opacity: 0
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

    gsap.set(".popup-icon__image, .popup-icon__background, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationY: 180
    });
  }

  if (flipY) {

    gsap.set(popupHolder, {
      rotationX: 180
    });

    gsap.set(".popup-icon__image, .popup-icon__background, .popup-image__image, .popup-image__background, .popup-text-boxes", {
      rotationX: 180
    });
  }

  if (firstPanel.icon) {

    gsap.set(firstPanel.targets.icon, {
      autoAlpha: 1,
      xPercent: 0
    });

    gsap.set(firstPanel.targets.iconElement, {
      x: -settings.textBoxHeight
    });
  }

  selectAll(".dummy").forEach(element => element.remove());
}

function createAnimation() {
  
  const {
    minOverflowDuration,
    overflowSpeed,
    textBoxHeight
  } = settings;

  const adjustWidth = settings.widthAdjust.toLowerCase() === "auto";

  const firstPanel = allPanels[0];
  const wait = `+=${settings.showDuration}`;

  const imageDuration = 0.8;
  const resizeDuration = 0.8;
  const iconEase = "power2";
  const imageEase = "power4";
  const showHideEase = "power1";
  const resizeEase = "power4";
  const textOutroEase = "power1";

  let prevPanel = null;
  let prevIcon = null;
  let prevImage = null;
  let prevHeading = null;
  let prevSubheading = null;

  gsap.defaults({
    ease: "power4"
  }); 
  
  const outroTl = gsap.timeline();
  const master = gsap.timeline({
    repeat: -1,
    repeatDelay: settings.replayWait
  });   

  master.set(popupHolder, { autoAlpha: 1 })
  .to(popupContent, {
    duration: 0.5,
    xPercent: 0,
    ease: showHideEase
  });

  allPanels.forEach(panel => {

    const { 
      heading, 
      headingChars, 
      icon, 
      iconElement, 
      image, 
      subheading, 
      subheadingChars 
    } = panel.targets;

    const tl = gsap.timeline();
    const headingTl = gsap.timeline();
    const subheadingTl = gsap.timeline();
    const iconTl = gsap.timeline();
    const imageTl = gsap.timeline();

    const isFirstPanel = (panel === firstPanel);

    tl.add("start")

    if (prevHeading) {
      
      tl.to(prevHeading, {
        duration: 0.3,
        y: `-=${textBoxHeight * 1 / panel.textScale}`,
        ease: textOutroEase
      }, "start")
      .set(prevHeading, {
        autoAlpha: 0
      }, ">");
    }

    if (prevSubheading) {

      tl.to(prevSubheading, {
        duration: 0.25,
        y: `-=${panel.headingHeight + textBoxHeight * 1 / panel.textScale}`,
        ease: textOutroEase
      }, "start+=0.06")
      .set(prevSubheading, {
        autoAlpha: 0
      }, ">");
    }

    tl.add("resize", prevHeading ? "-=0.2" : 0);

    if (adjustWidth && !isFirstPanel) {

      tl.to(popupIcons, {
        duration: resizeDuration,
        x: panel.iconX,
        ease: resizeEase
      }, "resize")
      .to(popupBackground, {
        duration: resizeDuration,
        scaleX: panel.bgScale,
        ease: resizeEase
      }, "resize");
    }

    headingTl.set(heading, {
      autoAlpha: 1
    })
    .to(headingChars, {
      duration: 0.08,
      opacity: 1,
      y: 0,
      stagger: 0.03
    }, 0);
    
    if (subheading) {

      subheadingTl.set(subheading, {
        autoAlpha: 1
      })
      .to(subheadingChars, {
        duration: 0.08,
        opacity: 1,
        stagger: 0.03
      });
    }

    const headingDuration = headingTl.duration();
    const subheadingDuration = subheadingTl.duration();

    const textStart = resizeDuration * 0.3;
    const headingStart = `resize+=${textStart}`;
    const subheadingStart = `resize+=${textStart + 0.25}`;
    const overflowRatio = 0.8;

    tl.add(headingTl, headingStart);
    tl.add(subheadingTl, subheadingStart);

    if (panel.headingOverlow) {

      tl.to(heading, {
        duration: Math.max(minOverflowDuration, panel.headingOverlow / overflowSpeed),
        x: `-=${panel.headingOverlow / panel.textScale}`,
        ease: "none",
      }, `resize+=${textStart + headingDuration * overflowRatio}`);
    }

    if (subheading && panel.subheadingOverlow) {

      tl.to(subheading, {
        duration: Math.max(minOverflowDuration, panel.subheadingOverlow / overflowSpeed),
        x: `-=${panel.subheadingOverlow / panel.textScale}`,
        ease: "none",
      }, `resize+=${0.25 + textStart + subheadingDuration * overflowRatio}`);
    }

    if (!icon && prevIcon) {

      iconTl.to(prevIcon, {
        xPercent: -100,
        duration: 0.3,
        ease: iconEase
      })
      .set(prevIcon, {
        autoAlpha: 0
      }, ">");

      tl.add(iconTl, "start+=0.3");
    }
    
    if (icon) {

      iconTl.set(icon, {
        autoAlpha: 1
      }, 0)
      .to(icon, {
        duration: 0.3,
        xPercent: 0,
        ease: iconEase
      }, 0);

      if (isFirstPanel) {

        iconTl.to(iconElement, {
          duration: 0.3,
          x: 0,
          ease: iconEase
        }, 0);
      }

      if (prevIcon) {

        iconTl.to(prevIcon, {
          duration: 0.3,
          xPercent: 100,
          ease: iconEase
        }, 0)
        .set(prevIcon, {
          autoAlpha: 0
        }, ">");
      }

      tl.add(iconTl, headingStart);
    }

    if (image) {

      imageTl.set(image, {
        autoAlpha: 1
      }, 0)
      .to(image, {
        duration: imageDuration,
        yPercent: -100,
        ease: imageEase
      }, 0);

      if (prevImage) {

        imageTl.to(prevImage, {
          duration: imageDuration,
          y: `-=${panel.imageHeight}`,
          ease: imageEase
        }, 0)
        .to(prevImage, {
          duration: imageDuration / 2,
          autoAlpha: 0,
          ease: imageEase
        }, 0);

        tl.add(imageTl, "start");

      } else {

        tl.add(imageTl, `resize+=${textStart + 0.35}`);
      }
    }

    tl.set({}, {}, wait);

    master.add(tl, isFirstPanel ? "-=0.5" : ">");

    prevIcon = icon;
    prevImage = image;
    prevPanel = panel;
    prevHeading = heading;
    prevSubheading = subheading;
  });

  if (prevHeading) {
      
    outroTl.to(prevHeading, {
      duration: 0.3,
      y: `-=${textBoxHeight * 1 / prevPanel.textScale}`,
      ease: textOutroEase
    }, 0)
    .set(prevHeading, {
      autoAlpha: 0
    }, ">");
  }

  if (prevSubheading) {

    outroTl.to(prevSubheading, {
      duration: 0.25,
      y: `-=${prevPanel.headingHeight + textBoxHeight * 1 / prevPanel.textScale}`,
      ease: textOutroEase
    }, 0.06)
    .set(prevSubheading, {
      autoAlpha: 0
    }, ">");
  }

  if (prevImage) {

    outroTl.to(prevImage, {
      duration: imageDuration,
      yPercent: 0,
      ease: imageEase
    }, 0)
    .set(prevImage, {
      autoAlpha: 0
    }, ">");
  }

  outroTl.to(popupContent, {
    duration: 0.3,
    xPercent: -100,
    x: prevIcon ? -textBoxHeight : 0,
    ease: showHideEase
  }, ">");

  master.add(outroTl);

  // if ($_devMode_$) {
  //   ScrubGSAPTimeline(master);
  // }
}
