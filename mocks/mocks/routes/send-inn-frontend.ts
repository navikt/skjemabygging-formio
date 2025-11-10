export default [
  {
    id: 'send-inn-frontend',
    url: '/send-inn-frontend',
    variants: [
      {
        id: 'available',
        type: 'static',
        options: {
          path: 'mocks/data/send-inn-frontend',
          options: {
            maxAge: 500,
          },
        },
      },
    ],
  },
];
