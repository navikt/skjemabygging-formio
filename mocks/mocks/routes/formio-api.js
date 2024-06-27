import formAccordion from '../data/formio-api/accordion.json';
import formActivities from '../data/formio-api/activities.json';
import formAttachment from '../data/formio-api/attachments.json';
import translationsConditionalXmas from '../data/formio-api/conditionalxmas-translation.json';
import formConditionalXmas from '../data/formio-api/conditionalxmas.json';
import formContainerDatagrid from '../data/formio-api/container-datagrid.json';
import formContainer from '../data/formio-api/container123.json';
import formCustomCompsAlert from '../data/formio-api/custom-components-alert.json';
import checkboxForm from '../data/formio-api/custom-components-checkbox.json';
import formCustomCompsDatagrid from '../data/formio-api/custom-components-datagrid.json';
import translationsCustomComps from '../data/formio-api/custom-components-translations.json';
import formCustomComps from '../data/formio-api/custom-components.json';
import translationsCypress101 from '../data/formio-api/cypress101-translation.json';
import formCypress101 from '../data/formio-api/cypress101.json';
import formCypressaxe from '../data/formio-api/cypressaxe.json';
import formDatagridConditional from '../data/formio-api/datagrid-conditional.json';
import formDatagridReactComponents from '../data/formio-api/datagrid-react-components.json';
import formDatagrid from '../data/formio-api/datagrid.json';
import formDrivingList from '../data/formio-api/driving-list.json';
import formSelectV1 from '../data/formio-api/form-select-v1.json';
import formSelectV2 from '../data/formio-api/form-select-v2.json';
import globalTranslationsEn from '../data/formio-api/global-translation.json';
import hiddenConditionalForm from '../data/formio-api/hidden-conditional.json';
import monthPickerForm from '../data/formio-api/month-picker.json';
import nav083501 from '../data/formio-api/nav083501.json';
import formNavdatepicker from '../data/formio-api/navdatepicker.json';
import numberForm from '../data/formio-api/number.json';
import formPengerOgKonto from '../data/formio-api/pengerOgKonto.json';
import formTestPrefillData from '../data/formio-api/prefill-data.json';
import radioForm from '../data/formio-api/radio.json';
import selectBoxesForm from '../data/formio-api/select-boxes.json';
import translationsSubmissionMethod from '../data/formio-api/submission-method-translations.json';
import formSubmissionMethod from '../data/formio-api/submission-method.json';
import formTestMellomlagringV2 from '../data/formio-api/test-mellomlagring-v2.json';
import formTestMellomlagring from '../data/formio-api/test-mellomlagring.json';

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
