export default [
  {
    id: 'post-azure-openid-token',
    url: '/azure-openid/oauth2/v2.0/token',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: '12345' },
        },
      },
    ],
  },
];
