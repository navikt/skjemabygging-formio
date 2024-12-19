module.exports = [
  {
    id: 'post-gotenberg-pdf',
    url: '/skjemabygging-proxy/extream',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            data: {
              result: [
                {
                  content: 'pdf',
                },
              ],
            },
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
