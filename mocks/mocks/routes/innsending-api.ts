import paabegyntInnsendt from '../data/innsending-api/active-tasks/ettersending.json';
import paabegyntMellomlagring from '../data/innsending-api/active-tasks/mellomlagring.json';
import paabegyntMellomlagringOgInnsendt from '../data/innsending-api/active-tasks/mellomlagringOgEttersending.json';
import activitesFuture from '../data/innsending-api/activities/activities-future.json';
import activitiesMultiple from '../data/innsending-api/activities/activities-multiple.json';
import activities from '../data/innsending-api/activities/activities.json';
import mellomlagringActivitiesPrefilledMaalgruppe from '../data/innsending-api/activities/mellomlagring-activities-prefilled-maalgruppe.json';
import mellomlagringActivities from '../data/innsending-api/activities/mellomlagring-activities.json';
import mellomlagringCheckbox from '../data/innsending-api/checkbox/mellomlagring-checkbox.json';
import mellomlagringDrivingListNoDates from '../data/innsending-api/driving-list/mellomlagring-driving-list-no-dates.json';
import mellomlagringDrivingList from '../data/innsending-api/driving-list/mellomlagring-driving-list.json';
import container123Complete from '../data/innsending-api/mellomlagring/container123/complete.json';
import containerDatagrid123Complete from '../data/innsending-api/mellomlagring/containerDatagrid123/complete.json';
import formSelectSoknadCompleteV1 from '../data/innsending-api/mellomlagring/form-select/saved-complete-v1.json';
import formSelectSoknadInvalidCountryV1 from '../data/innsending-api/mellomlagring/form-select/saved-invalid-country-v1.json';
import formSelectSoknadInvalidInstrumentV1 from '../data/innsending-api/mellomlagring/form-select/saved-invalid-instrument-v2.json';
import formSelectSoknadPartialV1 from '../data/innsending-api/mellomlagring/form-select/saved-partial-v1.json';
import mellomlagringValid1 from '../data/innsending-api/mellomlagring/getTestMellomlagring-valid-1.json';
import mellomlagringValid2 from '../data/innsending-api/mellomlagring/getTestMellomlagring-valid-2.json';
import mellomlagringValidExtraValues from '../data/innsending-api/mellomlagring/getTestMellomlagring-valid-extra-values.json';
import mellomlagringNestedValuesForeignBusiness from '../data/innsending-api/mellomlagring/mellomlagring-nested-values-foreign-business.json';
import mellomlagringNestedValuesNorwegianBusiness from '../data/innsending-api/mellomlagring/mellomlagring-nested-values-norwegian-business.json';
import nav083591soknadComplete from '../data/innsending-api/mellomlagring/nav083591/complete.json';
import responseWithInnsendingsId from '../data/innsending-api/mellomlagring/responseWithInnsendingsId.json';
import mellomlagringMonthPicker from '../data/innsending-api/month-picker/mellomlagring-month-picker.json';
import prefillDataNames from '../data/innsending-api/prefill-data/prefill-data-names.json';
import prefillDataUsa from '../data/innsending-api/prefill-data/prefill-data-usa.json';
import prefillData from '../data/innsending-api/prefill-data/prefill-data.json';
import mellomlagringRadio from '../data/innsending-api/radio/mellomlagring-radio.json';
import mellomlagringSelectBoxes from '../data/innsending-api/select-boxes/mellomlagring-select-boxes.json';
import tc01 from '../data/test-cases/tc01-innsending-nologin-soknad-body.json';
import tc02 from '../data/test-cases/tc02-innsending-nologin-soknad-body.json';
import { compareBodyMiddleware } from '../utils/testCaseUtils';

const objectToByteArray = (obj: any): number[] => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const base64Encode = (data: any): string => {
  return Buffer.from(data).toString('base64');
};

const convertToInnsendingApiResponse = (json: any): any => {
  return {
    ...json,
    hoveddokumentVariant: {
      ...json.hoveddokumentVariant,
      document: base64Encode(objectToByteArray(json.hoveddokumentVariant.document)),
    },
  };
};

function replySubmittedNologinApplication(body: any): any {
  return {
    innsendingsId: body.innsendingsId,
    label: body.tittel,
    status: 'Innsendt',
    mottattdato: '2023-10-10T10:02:00.328667+02:00',
    hoveddokumentRef: null,
    innsendteVedlegg: body.vedleggsListe
      .filter((v: any) => v.opplastingsStatus === 'LastetOpp')
      .map((v: any) => ({ vedleggsnr: v.vedleggsnr, tittel: v.tittel })),
    skalEttersendes: body.vedleggsListe
      .filter((v: any) => v.opplastingsStatus === 'SendSenere')
      .map((v: any) => ({ vedleggsnr: v.vedleggsnr, tittel: v.tittel })),
    skalSendesAvAndre: [],
    levertTidligere: [],
    sendesIkkeInn: [],
    navKanInnhente: [],
    ettersendingsfrist: null,
  };
}

export default [
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
            ['innsendingsId', 'hoveddokument.document', 'hoveddokumentVariant.document', 'vedleggsListe.filIdListe'],
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
            ['innsendingsId', 'hoveddokument.document', 'hoveddokumentVariant.document', 'vedleggsListe.filIdListe'],
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
