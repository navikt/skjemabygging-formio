export default [
  {
    id: 'team-logs',
    url: '/team-logs',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { body } = req;
            console.log('Team logs received:', body);
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({ status: 'logged' });
          },
        },
      },
    ],
  },
];
