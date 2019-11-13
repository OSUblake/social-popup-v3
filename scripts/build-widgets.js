const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const chalk = require("chalk");
const omit = require("lodash/omit");
const merge = require("lodash/merge");
const parseTemplate = require("./parse-template.js");

const srcDir = path.resolve(__dirname, "../public/widget");
const streamlabsDir = path.resolve(__dirname, "../build/streamlabs");
const streamElementsDir = path.resolve(__dirname, "../build/stream-elements");

const fileNames = [
  "widget.config.json",
  "widget.json",
  "widget.html",
  "widget.css",
  "widget.js"
];

let config, json, html, css, js, fields;

buildWidgets();

async function buildWidgets() {

  [config, json, html, css, js] = await Promise.all(fileNames.map(readFile));
  config = JSON.parse(config);
  fields = JSON.parse(json);

  html = prettier.format(html, {
    parser: "html"
  });

  css = prettier.format(css, {
    parser: "css"
  });

  js = prettier.format(js, {
    parser: "babel"
  });
  
  const tags = config.tags || ["$_","_$"];

  const missingHelper = (name) => {
    name = `${tags[0]}${name}${tags[1]}`
    console.log(chalk.red.bold(`(!) Missing or invalid ${name} setting`));
    return `${name}`;
  };

  const compile = {
    json: parseTemplate(json, tags, missingHelper),
    html: parseTemplate(html, tags, missingHelper),
    css: parseTemplate(css, tags, missingHelper),
    js: parseTemplate(js, tags, missingHelper),
  };

  createStreamlabs({
    fields: JSON.parse(json),
    config: config.streamlabs || {},
    compile
  });

  createStreamElements({
    fields: JSON.parse(json),
    config: config.streamElements || {},
    compile
  });
}

async function createStreamlabs({ fields, config, compile }) {

  const settings = {};

  Object.assign(settings, omit(config, [config.customFields]));

  if (config.customFields) {
    merge(fields, config.customFields);
  }

  Object.keys(fields).forEach(key => {

    settings[key] = `{${key}}`;

    const field = fields[key];

    switch (field.type) {

      case "number":
      case "text":
        fields[key] = {
          label: field.label,
          type: "textfield",
          value: field.value
        };
        break;

      case "colorpicker":
        fields[key] = {
          label: field.label,
          type: "colorpicker",
          value: field.value
        };
        break;

      case "slider":
        fields[key] = {
          label: field.label,
          type: "slider",
          name: "",
          value: field.value,
          max: field.max,
          min: field.min,
          steps: field.steps
        };
        break;

      case "dropdown":
        fields[key] = {
          label: field.label,
          type: "dropdown",
          value: field.value,
          options: field.options
        };
        break;

      case "fontpicker":
      case "googleFont":
        fields[key] = {
          label: field.label,
          type: "fontpicker",
          value: field.value
        };
        break;     

      case "image-input":
        fields[key] = {
          label: field.label,
          type: "image-input",
          value: field.value
        };
        break;

      case "remove":
        settings[key] = field.value;
        delete fields[key];
        break;  

      default:
        console.log("\n(!) Deleted field", field)
        settings[key] = field.value;
        delete fields[key];
        break;
    }

  });
  
  createDir(streamlabsDir);

  var json = prettier.format(JSON.stringify(fields), {
    parser: "json-stringify"
  });

  await Promise.all([
    writeFile(streamlabsDir, "widget.html", compile.html(settings)),
    writeFile(streamlabsDir, "widget.css", compile.css(settings)),
    writeFile(streamlabsDir, "widget.js", compile.js(settings)),
    writeFile(streamlabsDir, "widget.json",  json)
  ]);

  console.log(chalk.green(`created ${chalk.bold("Streamlabs widget")}`), chalk.reset());  
}

async function createStreamElements({ fields, config, compile }) {
  
  const settings = {};

  Object.assign(settings, omit(config, [config.customFields]));

  if (config.customFields) {
    merge(fields, config.customFields);
  }

  Object.keys(fields).forEach(key => {

    settings[key] = `{{${key}}}`;

    const field = fields[key];

    switch (field.type) {

      case "number":
          fields[key] = {
            label: field.label,
            type: "number",
            value: field.value
          };
          break;

      case "text":
        fields[key] = {
          label: field.label,
          type: "text",
          value: field.value
        };
        break;

      case "colorpicker":
        fields[key] = {
          label: field.label,
          type: "colorpicker",
          value: field.value
        };
        break;

      case "slider":
        fields[key] = {
          label: field.label,
          type: "slider",
          value: field.value,
          max: field.max,
          min: field.min,
          steps: field.steps
        };
        break;

      case "dropdown":
        fields[key] = {
          label: field.label,
          type: "dropdown",
          value: field.value,
          options: field.options
        };
        break;

      case "googleFont":
        fields[key] = {
          label: field.label,
          type: "googleFont",
          value: field.value
        };
        break;     

      case "image-input":
        fields[key] = {
          label: field.label,
          type: "image-input",
          value: field.value
        };
        break;

      case "remove":
        settings[key] = field.value;
        delete fields[key];
        break;  

      default:
        console.log("\n(!) Deleted field", field);
        settings[key] = field.value;
        delete fields[key];
        break;
    }
  });
  
  createDir(streamElementsDir);

  var json = prettier.format(JSON.stringify(fields), {
    parser: "json-stringify"
  });

  await Promise.all([
    writeFile(streamElementsDir, "widget.html", compile.html(settings)),
    writeFile(streamElementsDir, "widget.css", compile.css(settings)),
    writeFile(streamElementsDir, "widget.js", compile.js(settings)),
    writeFile(streamElementsDir, "widget.json",  json)
  ]);

  console.log(chalk.green(`created ${chalk.bold("StreamElements widget")}`), chalk.reset());
}

function createDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Cannot make dir ${dirPath}`, error);
    }
  });
}

function readFile(fileName) {
  return fs.promises.readFile(path.resolve(srcDir, fileName), "utf8");
}

function writeFile(dir, fileName, data) {
  return fs.promises.writeFile(path.resolve(dir, fileName), data);
}
