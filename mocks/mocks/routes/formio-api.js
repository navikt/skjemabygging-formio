const formCypress101 = require('../data/formio-api/cypress101.json');
const formCypressaxe = require('../data/formio-api/cypressaxe.json');
const formPengerOgKonto = require('../data/formio-api/pengerOgKonto.json');
const formConditionalXmas = require('../data/formio-api/conditionalxmas.json');
const formCustomComps = require('../data/formio-api/custom-components.json');
const formCustomCompsDatagrid = require('../data/formio-api/custom-components-datagrid.json');
const formDatagrid = require('../data/formio-api/datagrid.json');
const formContainer = require('../data/formio-api/container123.json');
const formContainerDatagrid = require('../data/formio-api/container-datagrid.json');
const formNavdatepicker = require('../data/formio-api/navdatepicker.json');
const formSubmissionMethod = require('../data/formio-api/submission-method.json');
const formTestMellomlagring = require('../data/formio-api/test-mellomlagring.json');
const formTestMellomlagringV2 = require('../data/formio-api/test-mellomlagring-v2.json');
const formSelectV1 = require('../data/formio-api/form-select-v1.json');
const formSelectV2 = require('../data/formio-api/form-select-v2.json');
const formTestPrefillData = require('../data/formio-api/prefill-data.json');
const translationsCypress101 = require('../data/formio-api/cypress101-translation.json');
const translationsConditionalXmas = require('../data/formio-api/conditionalxmas-translation.json');
const translationsCustomComps = require('../data/formio-api/custom-components-translations.json');
const translationsSubmissionMethod = require('../data/formio-api/submission-method-translations.json');
const globalTranslationsEn = require('../data/formio-api/global-translation.json');
const formCustomCompsAlert = require('../data/formio-api/custom-components-alert.json');
const formActivities = require('../data/formio-api/activities.json');
const formDatagridConditional = require('../data/formio-api/datagrid-conditional.json');
const formDatagridReactComponents = require('../data/formio-api/datagrid-react-components.json');
const nav083501 = require('../data/formio-api/nav083501.json');
const formDrivingList = require('../data/formio-api/driving-list.json');
const formAttachment = require('../data/formio-api/attachments.json');
const formYear = require('../data/formio-api/year.json');
const formTextfield = require('../data/formio-api/textfield.json');
const numberForm = require('../data/formio-api/number.json');
const formAccordion = require('../data/formio-api/accordion.json');
const checkboxForm = require('../data/formio-api/custom-components-checkbox.json');
const hiddenConditionalForm = require('../data/formio-api/hidden-conditional.json');
const radioForm = require('../data/formio-api/radio.json');
const selectBoxesForm = require('../data/formio-api/select-boxes.json');
const monthPickerForm = require('../data/formio-api/month-picker.json');

const allForms = [
  { form: formCypress101, translations: translationsCypress101 },
  { form: formCypressaxe, translations: undefined },
  { form: formPengerOgKonto, translations: undefined },
  { form: formConditionalXmas, translations: translationsConditionalXmas },
  { form: formContainer, translations: undefined },
  { form: formContainerDatagrid, translations: undefined },
  { form: formCustomComps, translations: translationsCustomComps },
  { form: formCustomCompsDatagrid, translations: undefined },
  { form: formCustomCompsAlert, translations: undefined },
  { form: formDatagrid, translations: undefined },
  { form: formNavdatepicker, translations: undefined },
  { form: formSubmissionMethod, translations: translationsSubmissionMethod },
  { form: formTestMellomlagring, formV2: formTestMellomlagringV2, translations: undefined },
  { form: formTestPrefillData, translations: undefined },
  { form: formSelectV1, formV2: formSelectV2, translations: undefined },
  { form: formActivities, translations: undefined },
  { form: formDatagridConditional, translations: undefined },
  { form: formDatagridReactComponents, translations: undefined },
  { form: nav083501, translations: undefined },
  { form: formDrivingList, translations: undefined },
  { form: formAttachment, translations: undefined },
  { form: formYear, translations: undefined },
  { form: formTextfield, translations: undefined },
  { form: numberForm, translations: undefined },
  { form: formAccordion, translations: undefined },
  { form: checkboxForm, translations: undefined },
  { form: hiddenConditionalForm, translations: undefined },
  { form: radioForm, translations: undefined },
  { form: selectBoxesForm, translations: undefined },
  { form: monthPickerForm, translations: undefined },
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
      {
        id: 'success-v2',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const formPath = req.query.path;
            if (formPath) {
              const testdata = findTestdata(formPath);
              const form = testdata?.formV2 ?? testdata?.form;
              if (form) {
                res.status(200);
                res.contentType('application/json; charset=UTF-8');
                res.send([form]);
              } else {
                res.status(404);
                res.send();
              }
            } else {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send(allForms.map((obj) => obj.formV2 ?? obj.form).filter((form) => !!form));
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
