import { escapeHtml } from "./utils.js";

export default (literalSections, ...substs) => {

  const raw = literalSections.raw;

  let result = "";

  for (let i = 0; i < substs.length; i++) {

    let subst = substs[i];
    let lit = raw[i];

    if (Array.isArray(subst)) {
      subst = subst.join("");
    }

    if (lit.endsWith("$")) {
      subst = escapeHtml(String(subst));
      lit = lit.slice(0, -1);
    }

    result += lit + subst;
  }

  result += raw[raw.length - 1];

  return result;
};
