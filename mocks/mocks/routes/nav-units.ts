const units = [
  { enhetNr: '0202', navn: 'Nav Beta', type: 'HMS' },
  { enhetNr: '0303', navn: 'Nav Gamma', type: 'YTA' },
  { enhetNr: '0101', navn: 'Nav Alpha', type: 'LOKAL' },
];

export default [
  {
    id: 'get-nav-units',
    url: '/norg2/api/v1/enhet',
    method: 'GET',
    variants: [
      { id: 'success', type: 'json', options: { status: 200, body: units } },
      { id: 'empty', type: 'json', options: { status: 200, body: [] } },
      { id: 'no-matching-types', type: 'json', options: { status: 200, body: [units[1]] } },
      {
        id: 'error',
        type: 'json',
        options: {
          status: 503,
          headers: { 'x-correlation-id': 'nav-unit-upstream' },
          body: { message: 'Nav unit service unavailable', correlationId: 'nav-unit-upstream' },
        },
      },
    ],
  },
];
