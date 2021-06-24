const allowedTags = ["svg", "g", "path"];
const allowedAttributes = ["d", "fill", "viewbox", "stroke", "transform", "stroke-width", "fill-rule", "xmlns"];

const SANITIZE_CONFIG = {
  addTags: allowedTags,
  addAttr: allowedAttributes,
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: allowedAttributes,
};

export { SANITIZE_CONFIG };
