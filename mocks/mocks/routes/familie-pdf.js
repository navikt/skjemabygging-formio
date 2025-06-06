module.exports = [
  {
    id: 'post-familie-pdf',
    url: '/api/pdf/v1/opprett-pdf',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: { content: 'pdf' },
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
            res.contentType('json; charset=UTF-8');
            res.send({ content: 'pdf' });
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
