import { getCountries } from "../../utils/countries.js";

const countries = {
  get: (req, res) => res.json(getCountries(req.query.lang)),
};

export default countries;
