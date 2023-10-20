module.exports = [
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
      {
        id: 'available-with-delay',
        type: 'static',
        delay: 1000,
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
