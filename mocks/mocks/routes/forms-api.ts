import globalTranslations from '../data/forms-api/global-translations.json';

export default [
  {
    id: 'get-global-translations',
    url: '/forms-api/v1/global-translations',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            // To update the mock data, just copy from prod https://forms-api.intern.nav.no/v1/global-translations
            res.send(globalTranslations);
          },
        },
      },
    ],
  },
  {
    id: 'get-form',
    url: '/forms-api/v1/forms/:formPath',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
            res.redirect(`/formio-api/form?path=${req.params.formPath}&single=true`);
          },
        },
      },
    ],
  },
  {
    id: 'get-form-translations',
    url: '/forms-api/v1/forms/:formPath/translations',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send([]);
          },
        },
      },
    ],
  },
  {
    id: 'get-static-pdfs',
    url: '/forms-api/v1/forms/:formPath/static-pdfs',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'en',
                fileName: 'en.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
              {
                languageCode: 'nb',
                fileName: 'no.pdf',
                createdAt: '2026-02-10T09:00:22.143+01',
                createdBy: 'John Doe',
              },
              {
                languageCode: 'nn',
                fileName: 'nn.pdf',
                createdAt: '2026-02-10T09:00:26.896+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'nb',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'nb',
                fileName: 'nb.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'en',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'en',
                fileName: 'en.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'fr',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'fr',
                fileName: 'fr.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'empty',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([]);
          },
        },
      },
    ],
  },
  {
    id: 'download-static-pdf',
    url: '/forms-api/v1/forms/:formPath/static-pdfs/:languageCode',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send({
              pdfBase64: 'Zm9yc3Rlc2lkZWJvZHk=',
            });
          },
        },
      },
    ],
  },
];
