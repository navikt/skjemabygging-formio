import moment from "moment";

export const getIso8601String = () => {
  return moment().toISOString();
};

const dateUtils = {
  getIso8601String,
};

export default dateUtils;
