import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import tc08a from '../data/test-cases/tc08a-cover-page-body.json';
import tc08b from '../data/test-cases/tc08b-cover-page-body.json';
import tc08c from '../data/test-cases/tc08c-static-pdf-ettersending-cover-page-body.json';
import tc08d from '../data/test-cases/tc08d-cover-page-body.json';
import tc08e from '../data/test-cases/tc08e-sendinn-cover-page-body.json';
import tc08f from '../data/test-cases/tc08f-sendinn-description-cover-page-body.json';
import { compareBodyMiddleware } from '../utils/testCaseUtils';

const defaultResponseBody = {
  foersteside: 'Zm9yc3Rlc2lkZWJvZHk=',
  loepenummer: '0001',
};

const onSuccess = (_req, res) => {
  res.status(200);
  res.contentType('application/json; charset=UTF-8');
  res.send(defaultResponseBody);
};

const onSendinnSuccess = (_req, res) =>
  res.status(200).json({
    foersteside: readFileSync(join(__dirname, '../data/innsending-api/files/mini.pdf')).toString('base64'),
    loepenummer: '0001',
  });

export default [
  {
    id: 'foersteside',
    url: '/skjemabygging-proxy/foersteside',
    method: 'POST',
    variants: [
      {
        id: 'success-tc08e-sendinn',
        type: 'middleware',
        options: { middleware: compareBodyMiddleware(tc08e, [], onSendinnSuccess) },
      },
      {
        id: 'success-tc08f-sendinn-description',
        type: 'middleware',
        options: { middleware: compareBodyMiddleware(tc08f, [], onSendinnSuccess) },
      },
      {
        id: 'success-sendinn',
        type: 'json',
        options: {
          status: 200,
          body: {
            foersteside: readFileSync(join(__dirname, '../data/innsending-api/files/mini.pdf')).toString('base64'),
            loepenummer: '0001',
          },
        },
      },
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: defaultResponseBody,
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
      {
        id: 'success-tc08a',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(
            tc08a,
            ['innsendingsId', 'mainDocument', 'mainDocumentAlt', 'attachments.fileIds'],
            onSuccess,
          ),
        },
      },
      {
        id: 'success-organizationnumber',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc08b, [], onSuccess),
        },
      },
      {
        id: 'success-tc08c-static-pdf-ettersending',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc08c, [], onSuccess),
        },
      },
      {
        id: 'success-tc08d',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(tc08d, [], onSuccess),
        },
      },
    ],
  },
];
