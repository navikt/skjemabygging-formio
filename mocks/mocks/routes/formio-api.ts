import formAccordion from '../data/formio-api/accordion.json';
import formActivities from '../data/formio-api/activities.json';
import formAttachment from '../data/formio-api/attachments.json';
import formComponentsTranslations from '../data/formio-api/components-translations.json';
import formComponents from '../data/formio-api/components.json';
import formConditionalDatagrid from '../data/formio-api/conditional-datagrid.json';
import conditionalPage from '../data/formio-api/conditional-page.json';
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
import datafetcherAnnetForm from '../data/formio-api/data-fetcher-annet.json';
import datafetcherContainer from '../data/formio-api/data-fetcher-container.json';
import datafetcherForm from '../data/formio-api/data-fetcher.json';
import formDatagridConditional from '../data/formio-api/datagrid-conditional.json';
import dataGridLogicBug from '../data/formio-api/datagrid-logic-bug.json';
import formDatagridReactComponents from '../data/formio-api/datagrid-react-components.json';
import formDatagrid from '../data/formio-api/datagrid.json';
import dataGridSkjemagruppeBug from '../data/formio-api/datagrid001.json';
import formDrivingList from '../data/formio-api/driving-list.json';
import errorSummaryFocusForm from '../data/formio-api/errorSummaryFocus.json';
import emailForm from '../data/formio-api/form-email.json';
import formSelectV1 from '../data/formio-api/form-select-v1.json';
import formSelectV2 from '../data/formio-api/form-select-v2.json';
import formUtilsCheckCondition from '../data/formio-api/form-utils-check-condition.json';
import hiddenConditionalForm from '../data/formio-api/hidden-conditional.json';
import introPageTranslations from '../data/formio-api/intro-page-translations.json';
import introPage from '../data/formio-api/intro-page.json';
import formTestMellomlagringNested from '../data/formio-api/mellomlagring-nested-values.json';
import monthPickerForm from '../data/formio-api/month-picker.json';
import nav083501 from '../data/formio-api/nav083501.json';
import nav111221bTranslations from '../data/formio-api/nav111221b-translations.json';
import nav111221b from '../data/formio-api/nav111221b.json';
import formNavdatepicker from '../data/formio-api/navdatepicker.json';
import nologinForm from '../data/formio-api/nologin.json';
import numberForm from '../data/formio-api/number.json';
import formPengerOgKonto from '../data/formio-api/pengerOgKonto.json';
import formPhoneNumberAreaCode from '../data/formio-api/phone-number-area-code.json';
import radioForm from '../data/formio-api/radio.json';
import selectBoxesForm from '../data/formio-api/select-boxes.json';
import selectForm from '../data/formio-api/select.json';
import formSkjemagruppeTest from '../data/formio-api/skjemagruppetest.json';
import translationsSubmissionMethod from '../data/formio-api/submission-method-translations.json';
import formSubmissionMethod from '../data/formio-api/submission-method.json';
import submissionTypeDigitalNoAttachments from '../data/formio-api/submission-type-digital-no-attachments.json';
import submissionTypeDigitalNoLogin from '../data/formio-api/submission-type-digital-no-login.json';
import submissionTypeDigital from '../data/formio-api/submission-type-digital.json';
import submissionTypeNoLogin from '../data/formio-api/submission-type-no-login.json';
import submissionTypeNone from '../data/formio-api/submission-type-none.json';
import submissionTypePaperDigitalNoLogin from '../data/formio-api/submission-type-paper-digital-no-login.json';
import submissionTypePaperDigital from '../data/formio-api/submission-type-paper-digital.json';
import submissionTypePaperNoLogin from '../data/formio-api/submission-type-paper-no-login.json';
import submissionTypePaper from '../data/formio-api/submission-type-paper.json';
import formTestMellomlagringV2 from '../data/formio-api/test-mellomlagring-v2.json';
import formTestMellomlagring from '../data/formio-api/test-mellomlagring.json';
import formatTextfield from '../data/formio-api/textfield-formating.json';
import formTextfield from '../data/formio-api/textfield.json';
import formYear from '../data/formio-api/year.json';
import formYourInformationTranslations from '../data/formio-api/your-information-translations.json';
import formYourInformation from '../data/formio-api/your-information.json';

const allForms = [
  { form: formCypress101, translations: translationsCypress101 },
  { form: introPage, translations: introPageTranslations },
  { form: formCypressaxe, translations: undefined },
  { form: formComponents, translations: formComponentsTranslations },
  { form: formPengerOgKonto, translations: undefined },
  { form: formPhoneNumberAreaCode, translations: undefined },
  { form: formConditionalXmas, translations: translationsConditionalXmas },
  { form: formConditionalDatagrid, translations: undefined },
  { form: formContainer, translations: undefined },
  { form: formContainerDatagrid, translations: undefined },
  { form: formCustomComps, translations: translationsCustomComps },
  { form: formCustomCompsDatagrid, translations: undefined },
  { form: formCustomCompsAlert, translations: undefined },
  { form: formDatagrid, translations: undefined },
  { form: formNavdatepicker, translations: undefined },
  { form: formSubmissionMethod, translations: translationsSubmissionMethod },
  { form: formTestMellomlagring, formV2: formTestMellomlagringV2, translations: undefined },
  { form: formYourInformation, translations: formYourInformationTranslations },
  { form: formTestMellomlagringNested, translations: formYourInformationTranslations },
  { form: formSelectV1, formV2: formSelectV2, translations: undefined },
  { form: formActivities, translations: undefined },
  { form: formDatagridConditional, translations: undefined },
  { form: formDatagridReactComponents, translations: undefined },
  { form: nav083501, translations: undefined },
  { form: formDrivingList, translations: undefined },
  { form: formAttachment, translations: undefined },
  { form: formYear, translations: undefined },
  { form: formTextfield, translations: undefined },
  { form: formatTextfield, translations: undefined },
  { form: numberForm, translations: undefined },
  { form: formAccordion, translations: undefined },
  { form: checkboxForm, translations: undefined },
  { form: hiddenConditionalForm, translations: undefined },
  { form: radioForm, translations: undefined },
  { form: selectBoxesForm, translations: undefined },
  { form: selectForm, translations: undefined },
  { form: monthPickerForm, translations: undefined },
  { form: emailForm, translations: undefined },
  { form: nav111221b, translations: nav111221bTranslations },
  { form: formUtilsCheckCondition, translations: undefined },
  { form: formSkjemagruppeTest, translations: undefined },
  { form: errorSummaryFocusForm, translations: undefined },
  { form: datafetcherForm, translations: undefined },
  { form: datafetcherAnnetForm, translations: undefined },
  { form: datafetcherContainer, translations: undefined },
  { form: submissionTypePaper, translations: undefined },
  { form: submissionTypeDigital, translations: undefined },
  { form: submissionTypeDigitalNoAttachments, translations: undefined },
  { form: submissionTypePaperDigital, translations: undefined },
  { form: submissionTypeNone, translations: undefined },
  { form: submissionTypeNoLogin, translations: undefined },
  { form: submissionTypeDigitalNoLogin, translations: undefined },
  { form: submissionTypePaperDigitalNoLogin, translations: undefined },
  { form: submissionTypePaperNoLogin, translations: undefined },
  { form: nologinForm, translations: undefined },
  { form: dataGridLogicBug, translations: undefined },
  { form: dataGridSkjemagruppeBug, translations: undefined },
  { form: conditionalPage, translations: undefined },
];

const findTestdata = (formPath: string) => allForms.find((testdata) => testdata.form.path === formPath);

export default [
  {
    id: 'get-form',
    url: '/formio-api/form',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
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
          middleware: (req: any, res: any) => {
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
          middleware: (req: any, res: any) => {
            const formPath = req.query['data.form'];
            const dataName = req.query['data.name'];
            if (dataName === 'global') {
              // Moved to forms-api mock
              res.status(404);
              res.send();
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
