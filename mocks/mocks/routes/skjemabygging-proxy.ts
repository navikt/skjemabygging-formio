import tc08a from '../data/test-cases/tc08a-cover-page-body.json';
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

export default [
  {
    id: 'foersteside',
    url: '/skjemabygging-proxy/foersteside',
    method: 'POST',
    variants: [
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
    ],
  },
];
