export default [
  {
    id: 'post-umami-event',
    url: '/umami',
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
        type: 'json',
        options: {
          status: 500,
          body: {},
        },
      },
    ],
  },
];
