const currencies = require('../data/kodeverk/currencies.json');

module.exports = [
  {
    id: 'get-kodeverk-currencies',
    url: '/skjemabygging-proxy/kodeverk/ValutaBetaling/*',
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
