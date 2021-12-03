import { Utils } from "formiojs";

const originalEvaluate = Utils.evaluate;

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
}

function addNullChecksToChainedLookup(chainedLookup, originalString) {
  const chainedLookupParts = chainedLookup.split(".");
  let safeChainedLookup = chainedLookupParts[0];
  for (let j = 1; j < chainedLookupParts.length; j++) {
    safeChainedLookup = safeChainedLookup + " && " + chainedLookupParts.slice(0, j + 1).join(".");
  }
  return originalString.replace(new RegExp(chainedLookup, "g"), `(${safeChainedLookup})`);
}

function mapChainedLookups(text) {
  let mappedString = text;
  const arrayOfChainedLookups = text.match(/((\w+\.)+\w+)/g) || [];
  [...new Set(arrayOfChainedLookups)].forEach(
    (chainedLookup) => (mappedString = addNullChecksToChainedLookup(chainedLookup, mappedString))
  );
  return mappedString;
}

function sanitizeJavaScriptCode(text) {
  if (typeof text !== "string") {
    return text;
  }
  return mapChainedLookups(text);
}

export { evaluateOverride, sanitizeJavaScriptCode };
