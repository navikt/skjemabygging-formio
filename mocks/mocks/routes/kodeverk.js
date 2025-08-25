const currencies = require('../data/kodeverk/currencies.json');
const temakoder = require('../data/kodeverk/temakoder.json');
const enhetstyper = require('../data/kodeverk/enhetstyper.json');
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
    id: 'get-kodeverk-temakoder',
    url: '/kodeverk/api/v1/kodeverk/TemaIFyllUt/*',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: temakoder,
        },
      },
    ],
  },
  {
    id: 'get-kodeverk-enhetstyper',
    url: '/kodeverk/api/v1/kodeverk/EnhetstyperNorg/*',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: enhetstyper,
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
