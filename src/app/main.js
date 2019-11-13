import * as dat from "dat.gui";
// import Handlebars from "handlebars/dist/cjs/handlebars";
import throttle from "lodash-es/throttle";
import invert from "lodash-es/invert";
import isEqual from "lodash-es/isEqual";
import omit from "lodash-es/omit";
// import pick from "lodash-es/pick";
import merge from "lodash-es/merge";
import upperFirst from "lodash-es/upperFirst";
import fontOptions from "./font-options.js";
import Store from "./store.js";
import parseTemplate from "./parse-template.js";

// blah

const settingsStore = new Store("scocialPopup1");

const urls = [
  "../widget/widget.config.json",
  "../widget/widget.json",
  "../widget/widget.html",
  "../widget/widget.css",
  "../widget/widget.js",
];

const guiControls = {
  clearStorage() {
    // settingsStore.clear();
    // update();
  },
  resetSettings
};

const gui = new dat.GUI({
  width: 500,
  closeOnTop: true
});

const gui2 = new dat.GUI({

});

// gui2.add(guiControls, "clearStorage").name("Clear Storage");
gui2.add(guiControls, "resetSettings").name("Reset GUI");

const iframe = document.querySelector("#iframe");

let settings, defaultSettings, controllers, folders;
let template, compile;

const onChange = throttle(update, 8);

init();

async function init() {

  let [ config, json, html, css, js ] = await loadFiles(urls);
  json = JSON.parse(json);
  config = JSON.parse(config);

  // Object.assign(json, config.development.customFields);

  merge(json, config.development.customFields);

  // console.log("JSON", json)

  template = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
    </html>
  `;

  const tags = config.tags || ["$_","_$"];

  const missingHelper = (name) => {
    name = `${tags[0]}${name}${tags[1]}`
    console.warn(`(!) Missing or invalid ${name} setting`);
    return `${name}`;
  };

  compile = parseTemplate(template, tags, missingHelper);

  const build = buildGui(gui, json);
  controllers = build.controllers;
  settings = build.settings;
  folders = build.folders;

  // console.log("SETTINGS", settings)

  Object.assign(
    settings, 
    omit(config, ["development", "streamlabs", "streamElements"]),
    omit(config.development, ["customFields"])
  );

  defaultSettings = JSON.parse(JSON.stringify(settings));

  const oldSettings = settingsStore.get();

  if (oldSettings) {

    const oldDefaults = JSON.parse(settingsStore.getDefault());

    if (!isEqual(settings, oldDefaults)) {
      settingsStore.setDefault(settings);
    } else {
      Object.assign(settings, JSON.parse(oldSettings));
      restoreSettings();
    }

  } else {
    settingsStore.setDefault(settings);
  }

  update();
}

function update() {

  iframe.srcdoc = compile(settings);    

  const event = new CustomEvent(settings.loadEvent, {
    detail: "hello"
  });

  const eventTarget = iframe[`content${upperFirst(settings.eventTarget)}`];
  eventTarget.dispatchEvent(event);

  settingsStore.set(settings);
}

function resetSettings() {

  Object.keys(settings).forEach(key => {
    const controller = controllers.get(key);

    if (controller) {
      controller.setValue(controller.initialValue);
      settings[key] = controller.initialValue;
    }
  });

  update();
}

function restoreSettings() {

  Object.keys(settings).forEach(key => {
    const controller = controllers.get(key);

    if (controller) {
      controller.setValue(settings[key]);
    }
  });
}

function buildGui(gui, fields) {

  const keys = Object.keys(fields);
  const controllers = new Map();
  const folders = new Map();
  const settings = {};
  
  keys.forEach(key => {

    const field = fields[key];
    const type = field.type;
    let folder = gui;
    let controller;

    if (field.folder) {

      if (!Array.isArray(field.folder)) {
        field.folder = [field.folder];
      }

      field.folder.forEach(folderName => {

        if (!folders.has(folderName)) {
          folders.set(folderName, folder.addFolder(folderName));
        }

        folder = folders.get(folderName);
      });
    }

    settings[key] = field.value;

    if (type === "slider") {
      controller = folder.add(settings, key, field.min, field.max, field.steps);      
    } else if (type === "googleFont") {
      controller = folder.add(settings, key, JSON.parse(JSON.stringify(fontOptions))); 
    } else if (type === "colorpicker") {     
      controller = folder.addColor(settings, key);      
    } else if (type === "dropdown") {
      controller = folder.add(settings, key, invert(field.options)); 
    } else {
      controller = folder.add(settings, key); 
    }

    controller.onChange(onChange);
    controllers.set(key, controller);
  });

  Object.keys(gui.__folders).forEach(key => {
    gui.__folders[key].open();
  });

  return {
    gui, controllers, settings, folders
  };
}

async function loadFiles(urls) {
  const responses = await Promise.all(urls.map(url => fetch(url)));
  return await Promise.all(responses.map(response => response.text()));
}