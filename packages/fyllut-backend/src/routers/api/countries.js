import { getCountries } from '../../utils/countries.js';

const countries = {
  get: (req, res) => res.set('Cache-Control', 'public, max-age=86400').json(getCountries(req.query.lang)),
};

export default countries;
