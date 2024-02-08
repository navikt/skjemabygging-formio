const formCypress101 = require('../data/formio-api/cypress101.json');
const formCypressaxe = require('../data/formio-api/cypressaxe.json');
const formPengerOgKonto = require('../data/formio-api/pengerOgKonto.json');
const formConditionalXmas = require('../data/formio-api/conditionalxmas.json');
const formCustomComps = require('../data/formio-api/custom-components.json');
const formCustomCompsDatagrid = require('../data/formio-api/custom-components-datagrid.json');
const formDatagrid = require('../data/formio-api/datagrid.json');
const formNavdatepicker = require('../data/formio-api/navdatepicker.json');
const formSubmissionMethod = require('../data/formio-api/submission-method.json');
const formTestMellomlagring = require('../data/formio-api/test-mellomlagring.json');
const formTestPrefillData = require('../data/formio-api/prefill-data.json');
const translationsCypress101 = require('../data/formio-api/cypress101-translation.json');
const translationsConditionalXmas = require('../data/formio-api/conditionalxmas-translation.json');
const translationsCustomComps = require('../data/formio-api/custom-components-translations.json');
const translationsSubmissionMethod = require('../data/formio-api/submission-method-translations.json');
const globalTranslationsEn = require('../data/formio-api/global-translation.json');
const formCustomCompsAlert = require('../data/formio-api/custom-components-alert.json');

const allForms = [
  { form: formCypress101, translations: translationsCypress101 },
  { form: formCypressaxe, translations: undefined },
  { form: formPengerOgKonto, translations: undefined },
  { form: formConditionalXmas, translations: translationsConditionalXmas },
  { form: formCustomComps, translations: translationsCustomComps },
  { form: formCustomCompsDatagrid, translations: undefined },
  { form: formCustomCompsAlert, translations: undefined },
  { form: formDatagrid, translations: undefined },
  { form: formNavdatepicker, translations: undefined },
  { form: formSubmissionMethod, translations: translationsSubmissionMethod },
  { form: formTestMellomlagring, translations: undefined },
  { form: formTestPrefillData, translations: undefined },
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
            if (formPath) {
              const testdata = findTestdata(formPath);
              if (testdata) {
                res.status(200);
                res.contentType('application/json; charset=UTF-8');
                res.send([testdata.form]);
              } else {
                res.status(404);
                res.send();
              }
            } else {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send(allForms.map((obj) => obj.form));
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
            const dataName = req.query['data.name'];
            if (dataName === 'global') {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send([globalTranslationsEn]);
            } else if (formPath) {
              const testdata = findTestdata(formPath);
              if (testdata?.translations) {
                res.status(200);
                res.contentType('application/json; charset=UTF-8');
                res.send([testdata.translations]);
              } else {
                res.status(404);
                res.send();
              }
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
