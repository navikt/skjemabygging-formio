module.exports = [
  {
    id: 'post-exstream-pdf',
    url: '/skjemabygging-proxy/exstream',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            data: {
              result: [
                {
                  content: 'pdf',
                },
              ],
            },
          },
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
            const html = extractHtmlFromRequest(req);
            const missingElements = verifyHtml(html, 'nb');
            if (missingElements.length > 0) {
              console.log(`[MOCKS] html in request: ${html}}`);
              res.status(500);
              res.send(
                `[MOCKS] Verification of request failed. Following elements not found in html: ${missingElements.join(', ')}`,
              );
              return;
            }

            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({
              data: {
                result: [
                  {
                    content: 'pdf',
                  },
                ],
              },
            });
          },
        },
      },
      {
        id: 'verify-nav111221b-nn',
        type: 'middleware',
        options: {
          middleware: async (req, res) => {
            const html = extractHtmlFromRequest(req);
            const missingElements = verifyHtml(html, 'nn');
            if (missingElements.length > 0) {
              console.log(`[MOCKS] html in request: ${html}}`);
              res.status(500);
              res.send(
                `[MOCKS] Verification of request failed. Following elements not found in html: ${missingElements.join(', ')}`,
              );
              return;
            }

            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send({
              data: {
                result: [
                  {
                    content: 'pdf',
                  },
                ],
              },
            });
          },
        },
      },
    ],
  },
];

function extractHtmlFromRequest(req) {
  const data = JSON.parse(Buffer.from(req.body.content.data, 'base64').toString());
  return Buffer.from(data.html, 'base64').toString();
}

const expectedPanelHeaders = {
  nb: ['Dine opplysninger', 'Din situasjon', 'Reiseperiode', 'Reiseavstand', 'Transportbehov'],
  nn: ['Dine opplysningar', 'Din situasjon', 'Reiseperiode', 'Reiseavstand', 'Transportbehov'],
};
const expectedLabels = {
  nb: [
    'Fornavn',
    'Etternavn',
    'Hvilken periode vil du søke for?',
    'Oppgi adressen du skal reise til',
    'Har du en reisevei på seks kilometer eller mer?',
    'Dårlig transporttilbud',
  ],
  nn: [
    'Fornamn',
    'Etternamn',
    'Kva periode vil du søkja for?',
    'Oppgi adressa du skal reisa til',
    'Har du ein reiseveg på seks kilometer eller meir?',
    'Dårleg transporttilbod',
  ],
};
const expectedInputValues = {
  nb: ['Ola', 'Nordmann', '08842748500', 'Testveien 1C', 'Arbeidstrening', 'Ingen buss kjører her i nærheten'],
  nn: ['Ola', 'Nordmann', '08842748500', 'Testveien 1C', 'Arbeidstrening', 'Ingen buss køyrer her i nærleiken'],
};

const verifyHtml = (html, lang) => {
  return [
    ...expectedPanelHeaders[lang].filter((panelHeader) => !html.includes(panelHeader)),
    ...expectedLabels[lang].filter((label) => !html.includes(label)),
    ...expectedInputValues[lang].filter((inputValue) => !html.includes(inputValue)),
  ];
};
