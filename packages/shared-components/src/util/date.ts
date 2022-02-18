import moment from "moment";

const getIso8601String = () => {
  return moment().toISOString();
}

export {
  getIso8601String,
};