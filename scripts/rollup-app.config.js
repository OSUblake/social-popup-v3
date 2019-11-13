
// import ignore from "rollup-plugin-ignore";
// import copy from "rollup-plugin-copy";
// import json from "rollup-plugin-json";
// import virtual from "rollup-plugin-virtual";
// import virtual_alias from "rollup-plugin-virtual-alias";

// import { readFileSync } from "fs";
// import fs from "fs";
// import path from "path";
// import widgetJson from "./src/widget/widget.json";
// import scss from "rollup-plugin-scss";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
// import browsersync from "rollup-plugin-browsersync";

import htmlTemplate from "rollup-plugin-generate-html-template";


// import { string } from "rollup-plugin-string";

export default {
  input: "src/app/main.js",
  output: {
    file: "public/app/main.js",
    format: "esm",
    sourcemap: true
    // sourcemap: true
  },
  // watch: {
  // 	include: ["src/**/*.*", "public/**/*.*"]
  // },
  plugins: [
    resolve(), 
    commonjs(), 
    // string({
    //   include: "public/widget/widget.*"
    // }),

    htmlTemplate({
      template: "src/app/index.html",
      target: "index.html",
      attrs: [`type="module"`],
      replaceVars: {
        '__CDN_URL__': "🤣😜🤷‍♂️😵💚"
      }
    }),

    // watching && browsersync({
    //   server: "public",
    //   watch: true,
    //   // files: ["public/**/*.*"],
    //   open: false,
    //   notify: false,
    //   port: 3000,

    // })
  ]
};
