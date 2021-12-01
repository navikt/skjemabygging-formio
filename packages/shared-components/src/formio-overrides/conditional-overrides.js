function addNullChecksToChainedLookup(chainedLookup, originalString) {
  const chainedLookupParts = chainedLookup.split(".");
  let safeChainedLookup = chainedLookupParts[0];
  for (let j = 1; j < chainedLookupParts.length; j++) {
    safeChainedLookup = safeChainedLookup + " && " + chainedLookupParts.slice(0, j + 1).join(".");
  }
  return originalString.replaceAll(chainedLookup, safeChainedLookup);
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

export { sanitizeJavaScriptCode };
