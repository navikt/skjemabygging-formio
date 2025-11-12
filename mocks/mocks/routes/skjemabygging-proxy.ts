export default [
  {
    id: 'foersteside',
    url: '/skjemabygging-proxy/foersteside',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            foersteside: 'Zm9yc3Rlc2lkZWJvZHk=',
            loepenummer: '0001',
          },
        },
      },
      {
        id: 'failure',
        type: 'text',
        options: {
          status: 500,
          body: 'Internal server error',
        },
      },
    ],
  },
];
