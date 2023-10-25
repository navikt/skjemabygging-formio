const responseWithInnsendingsId = require('../data/innsending-api/mellomlagring/responseWithInnsendingsId.json');
const innsendingValid = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid.json');

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
        id: 'success-with-delay',
        type: 'json',
        delay: 1000,
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
          status: 200,
          body: responseWithInnsendingsId,
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
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: convertToInnsendingApiResponse(innsendingValid),
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
