import currencies from '../data/kodeverk/currencies.json';

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
  {
    id: 'post-exstream-pdf',
    url: '/skjemabygging-proxy/exstream',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            data: {
              result: [
                {
                  content: 'pdf',
                },
              ],
            },
          },
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'Internal server error',
        },
      },
    ],
  },
];
