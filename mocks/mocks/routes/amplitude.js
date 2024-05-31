module.exports = [
  {
    id: 'amplitude',
    url: '/amplitude/collect-auto',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            code: 200,
          },
        },
      },
    ],
  },
];
