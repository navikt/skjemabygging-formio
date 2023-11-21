const responseWithInnsendingsId = require('../data/innsending-api/mellomlagring/responseWithInnsendingsId.json');
const mellomlagringValid1 = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid-1.json');
const mellomlagringValid2 = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid-2.json');
const paabegyntMellomlagringOgInnsendt = require('../data/innsending-api/active-tasks/mellomlagringOgEttersending.json');
const paabegyntMellomlagring = require('../data/innsending-api/active-tasks/mellomlagring.json');
const paabegyntInnsendt = require('../data/innsending-api/active-tasks/ettersending.json');

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
    id: 'post-send-inn',
    url: '/send-inn/fyllUt/v1/leggTilVedlegg',
    method: 'POST',
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
          body: 'Internal Server Error',
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
];
