import loader from "ejs-loader";
const ejs = {
  process: loader,
  query: {
    variable: "ctx",
    evaluate: /\{%([\s\S]+?)%\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g,
    escape: /\{\{\{([\s\S]+?)\}\}\}/g,
    esModule: false,
  },
};
export default ejs;
