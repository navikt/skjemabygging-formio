const responseWithInnsendingsId = require('../data/innsending-api/mellomlagring/responseWithInnsendingsId.json');
const innsendingValid = require('../data/innsending-api/mellomlagring/getTestMellomlagring-valid.json');

const INNSENDINGS_ID_STANDARD = '8e3c3621-76d7-4ebd-90d4-34448ebcccc3';
const INNSENDINGS_ID_UPDATE_ERROR = 'f99dc639-add1-468f-b4bb-961cdfd1e599';

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
            if (innsendingsId === INNSENDINGS_ID_UPDATE_ERROR) {
              res.status(500);
              res.send();
            } else {
              res.status(200);
              res.contentType('application/json; charset=UTF-8');
              res.send(
                convertToInnsendingApiResponse({
                  innsendingsId: innsendingsId,
                  endretDato: `2023-10-10T10:02:00.328667+02:00`,
                  hoveddokumentVariant: {
                    document: {
                      data: req.body.submission,
                    },
                  },
                }),
              );
            }
          },
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
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { innsendingsId } = req.params;
            switch (innsendingsId) {
              case INNSENDINGS_ID_STANDARD:
              case INNSENDINGS_ID_UPDATE_ERROR:
                res.status(200);
                res.contentType('application/json; charset=UTF-8');
                res.send(convertToInnsendingApiResponse(innsendingValid));
                break;
              default:
                res.status(500);
                res.send();
            }
          },
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
