const globalTranslations = require('../data/forms-api/global-translations.json');

module.exports = [
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
            res.send(globalTranslations);
          },
        },
      },
    ],
  },
];
