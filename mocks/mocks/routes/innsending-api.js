const responseWithInnsendingsId = require('../data/innsending-api/mellomlagring/responseWithInnsendingsId.json');
const mellomlagringValid1 = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid-1.json');
const mellomlagringValid2 = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid-2.json');
const container123Complete = require('../data/innsending-api/mellomlagring/container123/complete.json');
const containerDatagrid123Complete = require('../data/innsending-api/mellomlagring/containerDatagrid123/complete.json');
const mellomlagringValidExtraValues = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid-extra-values.json');
const prefillDataNames = require('../data/innsending-api/prefill-data/prefill-data-names.json');
const mellomlagringNestedValuesNorwegianBusiness = require('../data/innsending-api/mellomlagring/mellomlagring-nested-values-norwegian-business.json');
const mellomlagringNestedValuesForeignBusiness = require('../data/innsending-api/mellomlagring/mellomlagring-nested-values-foreign-business.json');
const activities = require('../data/innsending-api/activities/activities.json');
const activitiesMultiple = require('../data/innsending-api/activities/activities-multiple.json');
const paabegyntMellomlagringOgInnsendt = require('../data/innsending-api/active-tasks/mellomlagringOgEttersending.json');
const paabegyntMellomlagring = require('../data/innsending-api/active-tasks/mellomlagring.json');
const paabegyntInnsendt = require('../data/innsending-api/active-tasks/ettersending.json');
const formSelectSoknadPartialV1 = require('../data/innsending-api/mellomlagring/form-select/saved-partial-v1.json');
const formSelectSoknadCompleteV1 = require('../data/innsending-api/mellomlagring/form-select/saved-complete-v1.json');
const formSelectSoknadInvalidCountryV1 = require('../data/innsending-api/mellomlagring/form-select/saved-invalid-country-v1.json');
const formSelectSoknadInvalidInstrumentV1 = require('../data/innsending-api/mellomlagring/form-select/saved-invalid-instrument-v2.json');
const mellomlagringActivities = require('../data/innsending-api/activities/mellomlagring-activities.json');
const mellomlagringActivitiesPrefilledMaalgruppe = require('../data/innsending-api/activities/mellomlagring-activities-prefilled-maalgruppe.json');
const nav083591soknadComplete = require('../data/innsending-api/mellomlagring/nav083591/complete.json');
const mellomlagringDrivingList = require('../data/innsending-api/driving-list/mellomlagring-driving-list.json');
const mellomlagringDrivingListNoDates = require('../data/innsending-api/driving-list/mellomlagring-driving-list-no-dates.json');
const mellomlagringCheckbox = require('../data/innsending-api/checkbox/mellomlagring-checkbox.json');
const activitesFuture = require('../data/innsending-api/activities/activities-future.json');
const prefillData = require('../data/innsending-api/prefill-data/prefill-data.json');
const prefillDataUsa = require('../data/innsending-api/prefill-data/prefill-data-usa.json');
const mellomlagringSelectBoxes = require('../data/innsending-api/select-boxes/mellomlagring-select-boxes.json');
const mellomlagringRadio = require('../data/innsending-api/radio/mellomlagring-radio.json');
const mellomlagringMonthPicker = require('../data/innsending-api/month-picker/mellomlagring-month-picker.json');
const tc01 = require('../data/test-cases/tc01-innsending-nologin-soknad-body.json');
const tc02 = require('../data/test-cases/tc02-innsending-nologin-soknad-body.json');
const { compareBodyMiddleware } = require('../utils/testCaseUtils');

const objectToByteArray = (obj) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const base64Encode = (data) => {
  return Buffer.from(data).toString('base64');
};

const convertToInnsendingApiResponse = (json) => {
  return {
    ...json,
    hoveddokumentVariant: {
      ...json.hoveddokumentVariant,
      document: base64Encode(objectToByteArray(json.hoveddokumentVariant.document)),
    },
  };
};

module.exports = [
  {
    id: 'get-active-tasks',
    url: '/send-inn/frontend/v1/skjema/*',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: paabegyntMellomlagringOgInnsendt,
        },
      },
      {
        id: 'success-mellomlagring',
        type: 'json',
        options: {
          status: 200,
          body: paabegyntMellomlagring,
        },
      },
      {
        id: 'success-ettersending',
        type: 'json',
        options: {
          status: 200,
          body: paabegyntInnsendt,
        },
      },
    ],
  },
  {
    id: 'post-soknad',
    url: '/send-inn/fyllUt/v1/soknad*',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 201,
          body: responseWithInnsendingsId,
        },
      },
      {
        id: 'already-exists',
        type: 'json',
        options: {
          status: 200,
          body: { status: 'soknadAlreadyExists' },
        },
      },
    ],
  },
  {
    id: 'put-soknad',
    url: '/send-inn/fyllUt/v1/soknad/:innsendingsId',
    method: 'PUT',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { innsendingsId } = req.params;
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(
              convertToInnsendingApiResponse({
                innsendingsId: innsendingsId,
                endretDato: '2023-10-10T10:02:00.328667+02:00',
                hoveddokumentVariant: {
                  document: {
                    data: req.body.submission,
                  },
                },
              }),
            );
          },
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'Internal Server Error',
        },
      },
    ],
  },
  {
    id: 'get-soknad',
    url: '/send-inn/fyllUt/v1/soknad/:innsendingsId',
    method: 'GET',
    variants: [
      {
        id: 'success-1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringValid1),
        },
      },
      {
        id: 'success-2',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringValid2),
        },
      },
      {
        id: 'success-extra-values',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringValidExtraValues),
        },
      },
      {
        id: 'success-prefill-data',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(prefillDataNames),
        },
      },
      {
        id: 'success-mellomlagring-nested-norwegian-business',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringNestedValuesNorwegianBusiness),
        },
      },
      {
        id: 'success-mellomlagring-nested-foreign-business',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringNestedValuesForeignBusiness),
        },
      },
      {
        id: 'success-driving-list',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringDrivingList),
        },
      },
      {
        id: 'success-driving-list-no-dates',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringDrivingListNoDates),
        },
      },
      {
        id: 'success-activities-empty',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringActivities),
        },
      },
      {
        id: 'success-activities-prefilled-maalgruppe',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringActivitiesPrefilledMaalgruppe),
        },
      },
      {
        id: 'success-checkbox',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringCheckbox),
        },
      },
      {
        id: 'success-month-picker',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringMonthPicker),
        },
      },
      {
        id: 'success-select-boxes',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringSelectBoxes),
        },
      },
      {
        id: 'success-radio',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(mellomlagringRadio),
        },
      },
      {
        id: 'container123-complete',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(container123Complete),
        },
      },
      {
        id: 'containerdatagrid123-complete',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(containerDatagrid123Complete),
        },
      },
      {
        id: 'form-select-partial-v1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(formSelectSoknadPartialV1),
        },
      },
      {
        id: 'form-select-complete-v1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(formSelectSoknadCompleteV1),
        },
      },
      {
        id: 'form-select-invalid-country-v1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(formSelectSoknadInvalidCountryV1),
        },
      },
      {
        id: 'form-select-invalid-instrument-v1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(formSelectSoknadInvalidInstrumentV1),
        },
      },
      {
        id: 'nav083501-complete-v1',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(nav083591soknadComplete),
        },
      },
      {
        id: 'not-found',
        type: 'json',
        options: {
          status: 404,
          body: {
            message: 'Fant ikke søknad med innsendingsid not-found',
            errorCode: 'resourceNotFound',
          },
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'Internal Server Error',
        },
      },
    ],
  },
  {
    id: 'delete-soknad',
    url: '/send-inn/fyllUt/v1/soknad/:innsendingsId',
    method: 'DELETE',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {},
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'FAILURE',
        },
      },
    ],
  },
  {
    id: 'put-utfylt-soknad',
    url: '/send-inn/fyllUt/v1/utfyltsoknad/:innsendingsId',
    method: 'PUT',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 302,
          body: {},
          headers: {
            Location: 'http://localhost:3300/send-inn-frontend',
          },
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'FAILURE',
        },
      },
    ],
  },
  {
    id: 'upload-file',
    url: '/send-inn/v1/nologin-fillager',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware(req, res) {
            const vedleggId = req.query['vedleggId'] || 'vedlegg-id';
            const innsendingId = req.query['innsendingId'] || 'innsending-id';
            res.status(201);
            res.contentType('application/json; charset=UTF-8');
            res.send({
              filId: '92ee15dd-dc49-4c95-b9b6-6224bae088bb',
              vedleggId,
              innsendingId,
              filnavn: 'test.txt',
              storrelse: 40000,
            });
          },
        },
      },
    ],
  },
  {
    id: 'delete-files',
    url: '/send-inn/v1/nologin-fillager',
    method: 'DELETE',
    variants: [
      {
        id: 'success',
        type: 'status',
        options: {
          status: 204,
        },
      },
    ],
  },
  {
    id: 'delete-file',
    url: '/send-inn/v1/nologin-fillager/:filId',
    method: 'DELETE',
    variants: [
      {
        id: 'success',
        type: 'status',
        options: {
          status: 204,
        },
      },
    ],
  },
  {
    id: 'get-prefill-data',
    url: '/send-inn/fyllUt/v1/prefill-data',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: prefillData,
        },
      },
      {
        id: 'success-usa',
        type: 'json',
        options: {
          status: 200,
          body: prefillDataUsa,
        },
      },
      {
        id: 'success-empty',
        type: 'json',
        options: {
          status: 200,
          body: {},
        },
      },
    ],
  },
  {
    id: 'get-activities',
    url: '/send-inn/fyllUt/v1/aktiviteter',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const dagligreise = req.query.dagligreise;

            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            if (dagligreise === 'true') {
              res.send(activitiesMultiple); // Includes saksinformasjon (vedtak for daglig reise)
            } else {
              res.send(activities);
            }
          },
        },
      },
      {
        id: 'success-multiple',
        type: 'json',
        options: {
          status: 200,
          body: activitiesMultiple,
        },
      },
      {
        id: 'success-future',
        type: 'json',
        options: {
          status: 200,
          body: activitesFuture,
        },
      },
      {
        id: 'success-empty',
        type: 'json',
        options: {
          status: 200,
          body: [],
        },
      },
      {
        id: 'failure',
        type: 'json',
        options: {
          status: 500,
          body: {
            message: 'Serverfeil ved henting av aktiviteter',
            errorCode: 'arenaError',
          },
        },
      },
    ],
  },
  {
    id: 'post-nologin-soknad',
    url: '/send-inn/v1/nologin-soknad',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware(req, res) {
            const { body } = req;
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(replySubmittedNologinApplication(body));
          },
        },
      },
      {
        id: 'success-tc01',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(
            tc01,
            ['innsendingsId', 'hoveddokumentVariant.document', 'vedleggsListe.filIdListe'],
            (req, res) => {
              const { body } = req;
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send(replySubmittedNologinApplication(body));
            },
          ),
        },
      },
      {
        id: 'success-tc02',
        type: 'middleware',
        options: {
          middleware: compareBodyMiddleware(
            tc02,
            ['innsendingsId', 'hoveddokumentVariant.document', 'vedleggsListe.filIdListe'],
            (req, res) => {
              const { body } = req;
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send(replySubmittedNologinApplication(body));
            },
          ),
        },
      },
    ],
  },
];

function replySubmittedNologinApplication(body) {
  return {
    innsendingsId: body.innsendingsId,
    label: body.tittel,
    status: 'Innsendt',
    mottattdato: '2023-10-10T10:02:00.328667+02:00',
    hoveddokumentRef: null,
    innsendteVedlegg: body.vedleggsListe
      .filter((v) => v.opplastingsStatus === 'LastetOpp')
      .map((v) => ({ vedleggsnr: v.vedleggsnr, tittel: v.tittel })),
    skalEttersendes: body.vedleggsListe
      .filter((v) => v.opplastingsStatus === 'SendSenere')
      .map((v) => ({ vedleggsnr: v.vedleggsnr, tittel: v.tittel })),
    skalSendesAvAndre: [],
    levertTidligere: [],
    sendesIkkeInn: [],
    navKanInnhente: [],
    ettersendingsfrist: null,
  };
}
