const currencies = require('../data/kodeverk/currencies.json');
const areaCodes = require('../data/kodeverk/area-codes.json');

module.exports = [
  {
    id: 'get-kodeverk-currencies',
    url: '/kodeverk/api/v1/kodeverk/ValutaBetaling/*',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: currencies,
        },
      },
    ],
  },
  {
    id: 'get-kodeverk-area-codes',
    url: '/kodeverk/api/v1/kodeverk/Retningsnumre/*',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: areaCodes,
        },
      },
    ],
  },
];
