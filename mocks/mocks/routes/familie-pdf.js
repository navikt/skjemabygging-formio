module.exports = [
  {
    id: 'post-familie-pdf',
    url: '/api/v1/pdf/opprett-pdf',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'application/pdf',
        options: {
          status: 200,
          body: ['pdf'],
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
      {
        id: 'verify-nav111221b-nb',
        type: 'middleware',
        options: {
          middleware: async (req, res) => {
            res.status(200);
            res.contentType('application/pdf; charset=UTF-8');
            res.send(['pdf']);
          },
        },
      },
      {
        id: 'verify-nav111221b-nn',
        type: 'middleware',
        options: {
          middleware: async (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(['pdf']);
          },
        },
      },
    ],
  },
];
