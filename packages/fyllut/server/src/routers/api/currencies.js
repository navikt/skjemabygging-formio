import { getCurrencies } from "../../utils/currencies.js";

const currencies = {
  get: (req, res) => res.set("Cache-Control", "public, max-age=86400").json(getCurrencies(req.query.lang)),
};

export default currencies;
