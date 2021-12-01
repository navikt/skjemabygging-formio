function addNullChecksToChainedLookup(chainedLookup, originalString) {
  const chainedLookupParts = chainedLookup.split(".");
  let safeChainedLookup = chainedLookupParts[0];
  for (let j = 1; j < chainedLookupParts.length; j++) {
    safeChainedLookup = safeChainedLookup + " && " + chainedLookupParts.slice(0, j + 1).join(".");
  }
  return originalString.replace(chainedLookup, safeChainedLookup);
}

function mapChainedLookups(text) {
  let mappedString = text;
  const arrayOfChainedLookups = text.match(/((\w+\.)+\w+)/g) || [];
  for (let i = 0; i < arrayOfChainedLookups.length; i++) {
    const chainedLookup = arrayOfChainedLookups[i];
    mappedString = addNullChecksToChainedLookup(chainedLookup, mappedString);
  }
  return mappedString;
}

function sanitizeJavaScriptCode(text) {
  if (typeof text !== "string") {
    return text;
  }
  return mapChainedLookups(text);
}

export { sanitizeJavaScriptCode };
