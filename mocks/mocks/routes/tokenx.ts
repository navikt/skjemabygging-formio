export default [
  {
    id: 'get-tokenx-endpoint',
    url: '/tokenx/.well-known',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: { token_endpoint: 'http://127.0.0.1:3300/tokenx/token' },
        },
      },
    ],
  },
  {
    id: 'post-tokenx',
    url: '/tokenx/token',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'the-token' },
        },
      },
    ],
  },
];
