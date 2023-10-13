const formCypress101 = require('../data/formio-api/cypress101.json');
const formCypressaxe = require('../data/formio-api/cypressaxe.json');
const formPengerOgKonto = require('../data/formio-api/pengerOgKonto.json');
const formConditionalXmas = require('../data/formio-api/conditionalxmas.json');
const formCustomComps = require('../data/formio-api/custom-components.json');
const formNavdatepicker = require('../data/formio-api/navdatepicker.json');
const translationsCypress101 = require('../data/formio-api/cypress101-translation.json');
const translationsConditionalXmas = require('../data/formio-api/conditionalxmas-translation.json');
const translationsCustomComps = require('../data/formio-api/custom-components-translations.json');

const allForms = [
  { form: formCypress101, translations: translationsCypress101 },
  { form: formCypressaxe, translations: undefined },
  { form: formPengerOgKonto, translations: undefined },
  { form: formConditionalXmas, translations: translationsConditionalXmas },
  { form: formCustomComps, translations: translationsCustomComps },
  { form: formNavdatepicker, translations: undefined },
];

const findTestdata = (formPath) => allForms.find((testdata) => testdata.form.path === formPath);

module.exports = [
  {
    id: 'get-form',
    url: '/formio-api/form',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const formPath = req.query.path;
            const testdata = findTestdata(formPath);
            if (testdata) {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send([testdata.form]);
            } else {
              res.status(404);
              res.send();
            }
          },
        },
      },
    ],
  },
  {
    id: 'get-translations',
    url: '/formio-api/language/submission',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const formPath = req.query['data.form'];
            const testdata = findTestdata(formPath);
            if (testdata?.translations) {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send([testdata.translations]);
            } else {
              res.status(404);
              res.send();
            }
          },
        },
      },
    ],
  },
];
