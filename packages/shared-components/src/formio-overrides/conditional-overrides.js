import cloneDeep from "lodash.cloneDeep";
import set from "lodash.set";
import { Utils } from "formiojs";

const {
  getComponentPath,
  getDataParentComponent,
  getComponentPathWithoutIndicies,
  checkCustomConditional,
  checkSimpleConditional,
  checkJsonConditional,
} = Utils;

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

function sanitizeCustomConditional(text) {
  if (typeof text !== "string") {
    return text;
  }
  return mapChainedLookups(text);
}

function setPathToComponentAndPerentSchema(component) {
  component.path = getComponentPath(component);
  const dataParent = getDataParentComponent(component);
  if (dataParent && typeof dataParent === "object") {
    dataParent.path = getComponentPath(dataParent);
  }
}

function getRow(component, row, instance, conditional) {
  const condition = conditional || component.conditional;
  // If no component's instance passed (happens only in 6.x server), calculate its path based on the schema
  if (!instance) {
    instance = cloneDeep(component);
    setPathToComponentAndPerentSchema(instance);
  }
  const dataParent = getDataParentComponent(instance);
  const parentPathWithoutIndicies =
    dataParent && dataParent.path ? getComponentPathWithoutIndicies(dataParent.path) : null;
  if (dataParent && condition.when && condition.when.startsWith(parentPathWithoutIndicies)) {
    const newRow = {};
    set(newRow, parentPathWithoutIndicies, row);
    row = newRow;
  }

  return row;
}

function checkConditionOverride(component, row, data, form, instance) {
  const { customConditional, conditional } = component;
  if (customConditional) {
    return checkCustomConditional(
      component,
      sanitizeCustomConditional(customConditional),
      row,
      data,
      form,
      "show",
      true,
      instance
    );
  } else if (conditional && conditional.when) {
    row = getRow(component, row, instance);
    return checkSimpleConditional(component, conditional, row, data);
  } else if (conditional && conditional.json) {
    return checkJsonConditional(component, conditional.json, row, data, form, true);
  }

  // Default to show.
  return true;
}

export { sanitizeCustomConditional, checkConditionOverride };
