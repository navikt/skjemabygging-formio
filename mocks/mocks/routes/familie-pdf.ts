import tc01 from '../data/test-cases/tc01-nologin-pdf-body.json';
import tc03 from '../data/test-cases/tc03-pdf-request-components-all.json';
import tc04 from '../data/test-cases/tc04-pdf-input-escaping.json';
import tc06a from '../data/test-cases/tc06a-nologin-pdf-body.json';
import tc06b from '../data/test-cases/tc06b-nologin-pdf-body.json';
import tc07 from '../data/test-cases/tc07-pdf-body.json';
import tc09 from '../data/test-cases/tc09-pdf-components-identity-paper.json';
import tc10 from '../data/test-cases/tc10-pdf-components-identity-digital.json';
import tc11 from '../data/test-cases/tc11-pdf-components-identity-nologin.json';
import tc12 from '../data/test-cases/tc12-pdf-components-all-digital.json';
import tc13 from '../data/test-cases/tc13-pdf-conditional-all-digital.json';
import tc14 from '../data/test-cases/tc14-pdf-conditional-minimal-digital.json';
import tc15 from '../data/test-cases/tc15-pdf-conditional-paper.json';
import tc16 from '../data/test-cases/tc16-pdf-signature-default.json';
import tc17 from '../data/test-cases/tc17-pdf-signature-old-default.json';
import tc18 from '../data/test-cases/tc18-pdf-signatures-english.json';
import tc19 from '../data/test-cases/tc19-pdf-attachment-with-comment.json';
import tc20 from '../data/test-cases/tc20-pdf-data-fetcher-activity.json';
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
        id: 'success-tc06a',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc06a, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc06b',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc06b, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc07',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc07, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc09',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc09, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc10',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc10, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc11',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc11, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc12',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc12, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc13',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc13, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc14',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc14, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc15',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc15, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc16',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc16, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc17',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc17, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc18',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc18, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc19',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc19, ['bunntekst.upperMiddle'], (_, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ content: 'pdf' });
          }),
        },
      },
      {
        id: 'success-tc20',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc20, ['bunntekst.upperMiddle'], (_, res) => {
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
