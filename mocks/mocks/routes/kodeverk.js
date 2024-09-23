const currencies = require('../data/kodeverk/currencies.json');

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
];
