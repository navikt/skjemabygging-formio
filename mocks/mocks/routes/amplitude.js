module.exports = [
  {
    id: 'amplitude',
    url: '/amplitude/collect-auto',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'text',
        options: {
          status: 200,
          body: 'success',
        },
      },
    ],
  },
];
