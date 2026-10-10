/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var svg_exports = {};
__export(svg_exports, {
  validateDefinition: () => validateDefinition
});
module.exports = __toCommonJS(svg_exports);
const tags = /* @__PURE__ */ new Set(["g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);
const numbers = /* @__PURE__ */ new Set(["x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "strokeWidth", "opacity", "fillOpacity", "strokeOpacity", "strokeDashoffset"]);
const enums = { strokeLinecap: ["butt", "round", "square"], strokeLinejoin: ["miter", "round", "bevel"], fillRule: ["nonzero", "evenodd"], clipRule: ["nonzero", "evenodd"] };
function attrsOf(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid SVG attributes");
  const result = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== "string" || raw.length > 2e4) throw new Error("Invalid SVG attribute");
    let valid = false;
    if (numbers.has(key)) valid = raw.trim() !== "" && Number.isFinite(Number(raw)) && Math.abs(Number(raw)) <= 1e5;
    if (key === "fill" || key === "stroke") valid = /^(none|currentColor|transparent|#[\da-fA-F]{3,8}|[a-zA-Z]{1,20})$/.test(raw);
    if (key === "d") valid = /^[MmLlHhVvCcSsQqTtAaZz\d.eE+,\s-]+$/.test(raw);
    if (key === "points" || key === "strokeDasharray") valid = /^[\d.eE+,\s-]+$/.test(raw);
    if (key === "transform") valid = /^(\s*(matrix|translate|scale|rotate|skewX|skewY)\(\s*[-+\d.eE,\s]+\)\s*)+$/.test(raw);
    if (enums[key]) valid = enums[key].includes(raw);
    if (!valid) throw new Error(`Unsupported SVG attribute: ${key}`);
    result[key] = raw;
  }
  return result;
}
function validateDefinition(value) {
  if (!value || typeof value !== "object" || JSON.stringify(value).length > 5e4) throw new Error("SVG exceeds size limit");
  const definition = value;
  if (typeof definition.viewBox !== "string") throw new Error("SVG requires a viewBox");
  const box = definition.viewBox.trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || box.some((n) => !Number.isFinite(n) || Math.abs(n) > 1e5) || box[2] <= 0 || box[3] <= 0) throw new Error("Invalid SVG viewBox");
  let count = 0;
  const visit = (nodes2, depth) => {
    if (!Array.isArray(nodes2) || depth > 10) throw new Error("Invalid SVG structure");
    return nodes2.map((node) => {
      if (++count > 256 || !node || !tags.has(node.tag)) throw new Error("Unsupported SVG element");
      return { tag: node.tag, attrs: attrsOf(node.attrs), children: node.children ? visit(node.children, depth + 1) : [] };
    });
  };
  const nodes = visit(definition.nodes, 0);
  if (!count) throw new Error("SVG has no shapes");
  return { viewBox: box.join(" "), attrs: attrsOf(definition.attrs), nodes };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateDefinition
});
