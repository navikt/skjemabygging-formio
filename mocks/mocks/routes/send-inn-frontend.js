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
            // options for the express.static method
            maxAge: 500,
          },
        },
      },
    ],
  },
];
