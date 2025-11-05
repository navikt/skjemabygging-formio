const tc01 = require('../data/test-cases/tc01-nologin-pdf-body.json');
const { compareBodyMiddleware } = require('../utils/testCaseUtils');

module.exports = [
  {
    id: 'post-familie-pdf',
    url: '/api/pdf/v3/opprett-pdf',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            content: 'pdf',
          },
        },
      },
      {
        id: 'success-tc01',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc01, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
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
