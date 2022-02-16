import { Utils } from "formiojs";

const originalEvaluate = Utils.evaluate;
const reservedWords = ["instance", "util", "utils", "_"];

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
}

function addNullChecksToChainedLookup(chainedLookup, originalString) {
  const chainedLookupParts = chainedLookup.split(".");
  if (reservedWords.includes(chainedLookupParts[0])) {
    return originalString;
  }

  let safeChainedLookup = chainedLookupParts[0];
  for (let j = 1; j < chainedLookupParts.length; j++) {
    safeChainedLookup = safeChainedLookup + " && " + chainedLookupParts.slice(0, j + 1).join(".");
  }
  return originalString.replace(new RegExp(chainedLookup, "g"), `(${safeChainedLookup})`);
}

function mapChainedLookups(text) {
  let mappedString = text;
  /**
   * Matcher uttrykk:
   * - som starter med en eller flere grupper ((\w+\.)+) av
   *   - en eller flere [a-zA-Z0-9] (\w+)
   *   - etterfulgt av punktum (\.).
   * - som avsluttes med et eller flere [a-zA-Z0-9] (\w+)
   * - etterfulgt av en word boundary = noe som IKKE er [a-zA-Z0-9] (\b) (tas ikke med i strengen som matches)
   *   - Eksempler på word boundaries er mellomrom, likhetstegn, eller lignende
   * - og IKKE etterfølges av en parantes (?!\() (tas ikke med i strengen som matches)
   *
   * De to siste punktene (word boundary + negativ lookahead etter parantes) er lagt til for å ikke matche funksjonskall.
   *
   * Skal matche:
   * - obj.myVar
   * - obj.myVar1
   *
   * Skal IKKE matche:
   * - obj.myFunction()
   */
  const arrayOfChainedLookups = text.match(/((\w+\.)+\w+\b)(?!\()/g) || [];
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
