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
];
