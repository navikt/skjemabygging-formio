import { camelCase } from "./stringUtils";

export const toFormPath = (text) => camelCase(text).toLowerCase();

export const formMatcherPredicate = (pathFromUrl) => (form) => {
  return (
    form.path === pathFromUrl ||
    toFormPath(form.title) === pathFromUrl ||
    toFormPath(form.properties.skjemanummer) === pathFromUrl
  );
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
};
export default navFormUtils;
