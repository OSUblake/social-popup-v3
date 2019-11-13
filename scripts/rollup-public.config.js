import copy from "rollup-plugin-copy";

export default {
  input: "src/widget/widget.js",
  output: {
    file: "public/widget/widget.js",
    format: "iife"
  },
  plugins: [
    copy({
      targets: [
        {
          src: ["src/widget/*.{html,json,css}"],
          dest: "public/widget"
        },
        {
          src: "src/{vendor,assets}",
          dest: "public"
        }
      ]
    }),
  ]
};
