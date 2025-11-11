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
          body: {},
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
