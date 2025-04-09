module.exports = [
  {
    id: 'get-register-data-activities',
    url: '/register-data/api/ekstern/aktivitet',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send([
              {
                tekst: 'Aktivitet 1',
                id: 'activity1',
                type: 'BOUTGIFTER',
              },
              {
                tekst: 'Aktivitet 2',
                id: 'activity2',
                type: 'UTDANNING',
              },
              {
                tekst: 'Aktivitet 3',
                id: 'activity3',
                type: 'TILTAK',
              },
            ]);
          },
        },
      },
      {
        id: 'success-empty',
        type: 'json',
        options: {
          status: 200,
          body: [],
        },
      },
      {
        id: 'failure',
        type: 'json',
        options: {
          status: 500,
          body: {
            correlation_id: '314f1bcc-44da-4f74-b264-28311e32dcff',
            message: 'Feil ved kall til Tilleggsstonader for aktiviteter',
          },
        },
      },
    ],
  },
];
