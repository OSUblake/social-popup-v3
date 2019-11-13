// import resolve from "rollup-plugin-node-resolve";
// import commonjs from "rollup-plugin-commonjs";
// import browsersync from "rollup-plugin-browsersync";

// import htmlTemplate from "rollup-plugin-generate-html-template";


// import { string } from "rollup-plugin-string";
// import ignore from "rollup-plugin-ignore";
// import json from "rollup-plugin-json";
// import virtual from "rollup-plugin-virtual";
// import virtual_alias from "rollup-plugin-virtual-alias";

// import { readFileSync } from "fs";
// import fs from "fs";
// import path from "path";
// import widgetJson from "./src/widget/widget.json";

// import scss from "rollup-plugin-scss";
import copy from "rollup-plugin-copy";

export default {
  input: "src/widget/widget.js",
  output: {
    file: "public/widget/widget.js",
    format: "iife",
    // sourcemap: "inline"
  },
  plugins: [
    // scss({
    //   // output: "widget.css",
    //   outputStyle: "expanded"
    // }),
    copy({
      targets: [
        {
          // src: ["src/widget/widget.html", "src/widget/widget.json"],
          // src: ["src/widget/widget.{html,json,css}"],
          src: ["src/widget/*.{html,json,css}"],
          dest: "public/widget"
        },
        {
          // src: ["src/vendor", "src/assets"],
          src: "src/{vendor,assets}",
          dest: "public"
        },
        // {
        //   src: ["src/widget/*.*", "!src/widget/*.js"],
        //   dest: "public/widget"
        // }
      ]
    }),
  ]
};
