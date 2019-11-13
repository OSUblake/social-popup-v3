import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import htmlTemplate from "rollup-plugin-generate-html-template";

export default {
  input: "src/app/main.js",
  output: {
    file: "public/app/main.js",
    format: "esm"
  },
  plugins: [
    resolve(), 
    commonjs(), 
    htmlTemplate({
      template: "src/app/index.html",
      target: "index.html",
      attrs: [`type="module"`]
    })
  ]
};
