export const select = (selector, node = document) => node.querySelector(selector);
export const selectAll = (selector, node = document) => node.querySelectorAll(selector);
export const escapeHtml = value => value.replace(/[&<>'"`=\/]/g, e => `&#${e.charCodeAt(0)};`);


