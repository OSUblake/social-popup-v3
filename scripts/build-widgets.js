const fs = require("fs");
const path = require("path");
// const Sqrl = require("squirrelly");
const prettier = require("prettier");
// const Handlebars = require("handlebars");
const chalk = require("chalk");
const parseTemplate = require("./parse-template.js");

const omit = require("lodash/omit");
const merge = require("lodash/merge");
// const cloneDeep = require("lodash/cloneDeep");

// console.log("__filename", __filename);
// console.log("__dirname", __dirname);
// console.log("cwd", process.cwd());
// console.log("pwd", process.env.PWD);
// console.log("PARSE", path.parse(process.mainModule.filename).dir);
// console.log("RESOLVE", path.resolve(__dirname))

// console.log("\n\n");

// var srcDir = path.resolve("../");

var srcDir = path.resolve(__dirname, "../public/widget");
// var outDir = path.resolve(__dirname, "../build");
const streamlabsDir = path.resolve(__dirname, "../build/streamlabs");
const streamElementsDir = path.resolve(__dirname, "../build/stream-elements");

// console.log("SRC DIR", srcDir);
// console.log("OUT DIR", outDir);

const fileNames = [
  "widget.config.json",
  "widget.json",
  "widget.html",
  "widget.css",
  "widget.js"
];

let config, json, html, css, js, fields;

// var tempSettings = {
//   mainColor: "#ff0000",
//   msg: `Hello, World!`,
//   msg2: `👨‍👩‍👦‍👦 my family <div></div>`,
//   num: 3,
// };

// Handlebars.registerHelper("helperMissing", ({ name }) => {
//   console.log(chalk.red(`(!) Can't find custom field for: ${chalk.bold(`{{${name}}}`)}`));
//   return new Handlebars.SafeString(`{{${name}}}`);
// });

buildWidgets();


async function buildWidgets() {

  // [html, css, js, json] = await Promise.all(fileNames.map(name => fs.promises.readFile(path.resolve(srcDir, name), "utf8")));
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

  // const compileJson = parseTemplate(json, tags, missingHelper);
  // const compileHtml = parseTemplate(html, tags, missingHelper);
  // const compileCss = parseTemplate(css, tags, missingHelper);
  // const compileJs = parseTemplate(js, tags, missingHelper);

  const compile = {
    json: parseTemplate(json, tags, missingHelper),
    html: parseTemplate(html, tags, missingHelper),
    css: parseTemplate(css, tags, missingHelper),
    js: parseTemplate(js, tags, missingHelper),
  };

  // console.log("")
  // console.log("CONFIG", config)
  // console.log("FIELDS", fields)

  // let slSettings = cloneDeep(json);
  // let seSettings = cloneDeep(json);

  // console.log("SL SETTINGS", slSettings)
  // console.log("SE SETTINGS", seSettings)

  // const slSettings = JSON.parse(JSON.stringify());


  // html = Handlebars.compile(html);
  // css = Handlebars.compile(css);
  // js = Handlebars.compile(js);
  // json = Handlebars.compile(json);

  // createDir(streamElementsDir);
  // createDir(streamlabsDir);

  createStreamlabs({
    // fields: cloneDeep(json),
    // fields: JSON.parse(JSON.stringify(json)),
    fields: JSON.parse(json),
    config: config.streamlabs || {},
    compile
  });

  createStreamElements({
    fields: JSON.parse(json),
    config: config.streamElements || {},
    compile
  });


  // logFiles();
}

async function createStreamlabs({ fields, config, compile }) {

  // console.log("FIELDS", fields)
  // console.log("CONFIG 1", config)

  const settings = {};

  Object.assign(settings, omit(config, [config.customFields]));

  if (config.customFields) {
    merge(fields, config.customFields);
  }

  // console.log(Object.keys(fields))

  Object.keys(fields).forEach(key => {

    settings[key] = `{${key}}`;

    const field = fields[key];
    // const type = field.type;

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
        console.log("\nDELETE", field)
        // console.log("\nDELETE", field.type)
        settings[key] = field.value;
        delete fields[key];
        break;
    }

  });

  // console.log("SETTINGS")
  // console.log(settings)


  // var prettierConfig = {
  //   "parser": "json",
  //   "arrowParens": "avoid",
  //   "bracketSpacing": true,
  //   "htmlWhitespaceSensitivity": "css",
  //   "insertPragma": false,
  //   "jsxBracketSameLine": false,
  //   "jsxSingleQuote": false,
  //   "printWidth": 80,
  //   "proseWrap": "preserve",
  //   "quoteProps": "as-needed",
  //   "requirePragma": false,
  //   "semi": true,
  //   "singleQuote": false,
  //   "tabWidth": 2,
  //   "trailingComma": "none",
  //   "useTabs": false
  // };

  // var prettierConfig = {
  //   parser: "json-stringify"
  // };
  
  createDir(streamlabsDir);

  // writeFile(streamlabsDir, "widget.json", prettier.format(JSON.stringify(fields)), prettierConfig)

  // var html = prettier.format(compile.html(settings), {
  //   parser: "html"
  // });

  // var css = prettier.format(compile.css(settings), {
  //   parser: "css"
  // });

  // var css = compile.css(settings);

  // var js = prettier.format(compile.js(settings), {
  //   parser: "babel"
  // });

  var json = prettier.format(JSON.stringify(fields), {
    parser: "json-stringify"
  });

  // await Promise.all([
  //   writeFile(streamlabsDir, "widget.html", html),
  //   writeFile(streamlabsDir, "widget.css", css),
  //   writeFile(streamlabsDir, "widget.js", js),
  //   writeFile(streamlabsDir, "widget.json",  json)
  // ]);

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

  // console.log(Object.keys(fields))

  Object.keys(fields).forEach(key => {

    settings[key] = `{{${key}}}`;

    const field = fields[key];
    // const type = field.type;

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
        console.log("\nDELETE", field)
        // console.log("\nDELETE", field.type)
        settings[key] = field.value;
        delete fields[key];
        break;
    }
  });

  // console.log("SETTINGS")
  // console.log(settings)


  // var prettierConfig = {
  //   "parser": "json",
  //   "arrowParens": "avoid",
  //   "bracketSpacing": true,
  //   "htmlWhitespaceSensitivity": "css",
  //   "insertPragma": false,
  //   "jsxBracketSameLine": false,
  //   "jsxSingleQuote": false,
  //   "printWidth": 80,
  //   "proseWrap": "preserve",
  //   "quoteProps": "as-needed",
  //   "requirePragma": false,
  //   "semi": true,
  //   "singleQuote": false,
  //   "tabWidth": 2,
  //   "trailingComma": "none",
  //   "useTabs": false
  // };

  // var prettierConfig = {
  //   parser: "json-stringify"
  // };
  
  createDir(streamElementsDir);

  // writeFile(streamlabsDir, "widget.json", prettier.format(JSON.stringify(fields)), prettierConfig)

  // var html = prettier.format(compile.html(settings), {
  //   parser: "html"
  // });

  // var css = prettier.format(compile.css(settings), {
  //   parser: "css"
  // });

  // var css = compile.css(settings);

  // var js = prettier.format(compile.js(settings), {
  //   parser: "babel"
  // });

  var json = prettier.format(JSON.stringify(fields), {
    parser: "json-stringify"
  });

  // await Promise.all([
  //   writeFile(streamlabsDir, "widget.html", html),
  //   writeFile(streamlabsDir, "widget.css", css),
  //   writeFile(streamlabsDir, "widget.js", js),
  //   writeFile(streamlabsDir, "widget.json",  json)
  // ]);

  await Promise.all([
    writeFile(streamElementsDir, "widget.html", compile.html(settings)),
    writeFile(streamElementsDir, "widget.css", compile.css(settings)),
    writeFile(streamElementsDir, "widget.js", compile.js(settings)),
    writeFile(streamElementsDir, "widget.json",  json)
  ]);

  console.log(chalk.green(`created ${chalk.bold("StreamElements widget")}`), chalk.reset());
}

// async function _createStreamlabs() {

//   await Promise.all([
//     writeFile(streamlabsDir, "widget.html", html(tempSettings)),
//     writeFile(streamlabsDir, "widget.css", css(tempSettings)),
//     writeFile(streamlabsDir, "widget.js", js(tempSettings)),
//     writeFile(streamlabsDir, "widget.json", json(tempSettings)),
//   ]);

//   // console.log("Created Streamlabs widget");
//   console.log(chalk.green(`created ${chalk.bold("Streamlabs widget")}`));
// }

// async function _createStreamElements() {

//   await Promise.all([
//     writeFile(streamElementsDir, "widget.html", html(tempSettings)),
//     writeFile(streamElementsDir, "widget.css", css(tempSettings)),
//     writeFile(streamElementsDir, "widget.js", js(tempSettings)),
//     writeFile(streamElementsDir, "widget.json", json(tempSettings)),
//   ]);

//   // console.log("Created Streamlabs widget");
//   console.log(chalk.green(`created ${chalk.bold("StreamElements widget")}`));
// }



// async function buildWidgets1() {

//   // [html, css, js, json] = await Promise.all(fileNames.map(name => fs.promises.readFile(path.resolve(srcDir, name), "utf8")));
//   [html, css, js, json] = await Promise.all(fileNames.map(readFile));
//   settings = JSON.parse(json);

//   html = Sqrl.Compile(html);
//   css = Sqrl.Compile(css);
//   js = Sqrl.Compile(js);
//   json = Sqrl.Compile(json);

//   createDir(streamElementsDir);
//   createDir(streamlabsDir);

//   createStreamlabs();
//   createStreamElements();
//   // logFiles();
// }

// async function createStreamlabs1() {

//   await Promise.all([
//     writeFile(streamlabsDir, "widget.html", html(tempSettings, Sqrl)),
//     writeFile(streamlabsDir, "widget.css", css(tempSettings, Sqrl)),
//     writeFile(streamlabsDir, "widget.js", js(tempSettings, Sqrl)),
//     writeFile(streamlabsDir, "widget.json", json(tempSettings, Sqrl)),
//   ]);

//   console.log("Created Streamlabs widget");
// }

// async function createStreamElements1() {

//   await Promise.all([
//     writeFile(streamElementsDir, "widget.html", html(tempSettings, Sqrl)),
//     writeFile(streamElementsDir, "widget.css", css(tempSettings, Sqrl)),
//     writeFile(streamElementsDir, "widget.js", js(tempSettings, Sqrl)),
//     writeFile(streamElementsDir, "widget.json", json(tempSettings, Sqrl)),
//   ]);

//   console.log("Created Streamlabs widget");
// }

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




// function logFiles() {

//   console.log("\n\n");
//   console.log("\n*** HTML", html)
//   console.log("\n*** CSS", css)
//   console.log("\n*** JS", js)
//   console.log("\n*** JSON", json)
//   console.log("\n*** SETTINGS", settings)
// }

// fs.readdir(srcDir, (err, items) => {
//   console.log("ITEMS", items);
// });

// var files = fs.readdirSync(srcDir);
// console.log("FILES", files)

// const settings = {
//   mainColor: "#ff0000",
//   msg: `Hello, World!`
// };

// const template = `
//   {{msg}}
//   color: {{mainColor}}
//   {{nothing}}
// `;

// var compiled = Sqrl.Compile(template);

// console.log("\n *** START COMPILED ***");
// console.log(compiled);
// console.log("*** END COMPILED ***");
// console.log("\n\n");

// var res = compiled(settings, Sqrl);

// console.log("*** TEMPLATE");
// console.log(res);

// console.log("BUILD WIDGT");
