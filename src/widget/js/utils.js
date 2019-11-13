
// export const absoluteValue = value => Math.abs(parseFloat(value));

// export const clamp = (min, max, value) => Math.min(Math.max(value, min), max);

export const escapeHtml = value => value.replace(/[&<>'"`=\/]/g, e => `&#${e.charCodeAt(0)};`);

// export const isNumeric = value => !isNaN(value - parseFloat(value));

export const select = (selector, node = document) => node.querySelector(selector);

export const selectAll = (selector, node = document) => node.querySelectorAll(selector);

// export const toRGBA = (color, opacity) => {
//   let [r,g,b,a] = ColorPropsPlugin.parseColor(color);

//   if (!isNumeric(a)) {
//     opacity = absoluteValue(opacity);   
//     a = isNumeric(opacity) ? opacity : 1;
//   }

//   return `rgba(${r},${g},${b},${clamp(0, 1, a)})`;
// }


