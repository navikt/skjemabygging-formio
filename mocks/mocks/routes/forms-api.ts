import globalTranslations from '../data/forms-api/global-translations.json';
import publishedGlobalTranslations from '../data/forms-api/published-global-translations';
import { sendinnJourneyForm } from '../data/forms-api/sendinn-journey/sendinnJourneyForm';
import { sendinnFormLoadingForm } from '../data/forms-api/sendinn/formLoadingForm';
import { latestSendinnGlobalTranslations } from '../data/forms-api/sendinn/latestGlobalTranslations';
import { getMockTranslationsFromForm } from '../form-builder/shared/utils';
import { findTestdata } from './formio-api';

const toFormsApiTranslations = (formPath: string) => {
  const translationData = findTestdata(formPath)?.translations?.data;
  if (!translationData) {
    return [];
  }

  const language = translationData.language.startsWith('nn')
    ? 'nn'
    : translationData.language.startsWith('nb') || translationData.language === 'no'
      ? 'nb'
      : 'en';
  return Object.entries(translationData.i18n).map(([key, value]) => ({
    key,
    [language]: value,
  }));
};

export default [
  {
    id: 'get-global-translations',
    url: '/forms-api/v1/global-translations',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            // To update the mock data, just copy from prod https://forms-api.intern.nav.no/v1/global-translations
            res.send(globalTranslations);
          },
        },
      },
      {
        id: 'sendinn',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(latestSendinnGlobalTranslations);
          },
        },
      },
    ],
  },
  {
    id: 'get-published-global-translations',
    url: '/forms-api/v1/published-global-translations/:languageCode',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(publishedGlobalTranslations[req.params.languageCode] ?? {});
          },
        },
      },
    ],
  },
  {
    id: 'get-forms',
    url: '/forms-api/v1/forms',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (_req: any, res: any) => {
            res.redirect('/formio-api/form');
          },
        },
      },
    ],
  },
  {
    id: 'get-form',
    url: '/forms-api/v1/forms/:formPath',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
            res.redirect(`/formio-api/form?path=${req.params.formPath}&single=true`);
          },
        },
      },
      {
        id: 'sendinn-paper-disabled',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const form = sendinnFormLoadingForm();
            res.status(200).json({
              ...form,
              properties: { ...form.properties, subsequentSubmissionTypes: ['DIGITAL'] },
            });
          },
        },
      },
      {
        id: 'sendinn-forced-unit',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const form = sendinnJourneyForm();
            res
              .status(200)
              .json({ ...form, properties: { ...form.properties, enhetMaVelgesVedPapirInnsending: true } });
          },
        },
      },
      {
        id: 'sendinn-hidden-collection',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const form = sendinnJourneyForm();
            res.status(200).json({
              ...form,
              properties: {
                ...form.properties,
                enhetMaVelgesVedPapirInnsending: true,
                hideUserTypes: true,
              },
            });
          },
        },
      },
      ...[true, false].flatMap((hideUserTypes) =>
        [true, false, undefined].map((forcedUnit) => ({
          id: `sendinn-collection-${hideUserTypes}-${forcedUnit ?? 'absent'}`,
          type: 'middleware',
          options: {
            middleware: (_req, res) => {
              const form = sendinnJourneyForm();
              res.status(200).json({
                ...form,
                properties: {
                  ...form.properties,
                  hideUserTypes,
                  ...(forcedUnit === undefined ? {} : { enhetMaVelgesVedPapirInnsending: forcedUnit }),
                },
              });
            },
          },
        })),
      ),
      {
        id: 'sendinn-nynorsk',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const form = sendinnJourneyForm();
            res.status(200).json({
              ...form,
              publishedLanguages: ['nn', 'en'],
              properties: { ...form.properties, hideUserTypes: true },
            });
          },
        },
      },
      {
        id: 'sendinn-error',
        type: 'json',
        options: {
          status: 503,
          headers: { 'x-correlation-id': 'sendinn-form-upstream-error' },
          body: {
            errorCode: 'SERVICE_UNAVAILABLE',
            message: 'Forms service unavailable',
            correlationId: 'sendinn-form-upstream-error',
          },
        },
      },
    ],
  },
  {
    id: 'get-form-translations',
    url: '/forms-api/v1/forms/:formPath/translations',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req: any, res: any) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');
            res.send(toFormsApiTranslations(req.params.formPath));
          },
        },
      },
      {
        id: 'sendinn-nynorsk',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const translations = getMockTranslationsFromForm(sendinnJourneyForm(), 'nn').data.i18n;
            res.status(200).json(Object.entries(translations).map(([key, nn]) => ({ key, nn })));
          },
        },
      },
    ],
  },
  {
    id: 'get-static-pdfs',
    url: '/forms-api/v1/forms/:formPath/static-pdfs',
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
                languageCode: 'en',
                fileName: 'en.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
              {
                languageCode: 'nb',
                fileName: 'no.pdf',
                createdAt: '2026-02-10T09:00:22.143+01',
                createdBy: 'John Doe',
              },
              {
                languageCode: 'nn',
                fileName: 'nn.pdf',
                createdAt: '2026-02-10T09:00:26.896+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'only-nb',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'nb',
                fileName: 'nb.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'only-en',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'en',
                fileName: 'en.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'only-fr',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([
              {
                languageCode: 'fr',
                fileName: 'fr.pdf',
                createdAt: '2026-02-10T09:00:40.274+01',
                createdBy: 'John Doe',
              },
            ]);
          },
        },
      },
      {
        id: 'empty',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send([]);
          },
        },
      },
    ],
  },
  {
    id: 'download-static-pdf',
    url: '/forms-api/v1/forms/:formPath/static-pdfs/:languageCode',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.status(200);
            res.contentType('application/json; charset=UTF-8');

            res.send({
              pdfBase64: 'Zm9yc3Rlc2lkZWJvZHk=',
            });
          },
        },
      },
    ],
  },
];
