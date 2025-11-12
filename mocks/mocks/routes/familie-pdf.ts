import tc01 from '../data/test-cases/tc01-nologin-pdf-body.json';
import tc03 from '../data/test-cases/tc03-pdf-request-components-all.json';
import tc04 from '../data/test-cases/tc04-pdf-input-escaping.json';
import { compareBodyMiddleware } from '../utils/testCaseUtils';

export default [
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
        id: 'success-tc03',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc03, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc04',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc04, ['bunntekst.upperMiddle'], (_, res) => {
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
