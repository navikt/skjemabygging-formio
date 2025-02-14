import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';

const forms: Form[] = [
  {
    path: 'nav123451',
    skjemanummer: 'NAV 12-34.51',
    title: 'Testskjema 1',
    properties: { skjemanummer: 'NAV 12-34.51' } as FormPropertiesType,
  } as Form,
  {
    path: 'nav123452',
    skjemanummer: 'NAV 12-34.52',
    title: 'Testskjema 2',
    properties: { skjemanummer: 'NAV 12-34.52' } as FormPropertiesType,
  } as Form,
  {
    path: 'nav123453',
    skjemanummer: 'NAV 12-34.53',
    title: 'Testskjema 3',
    properties: { skjemanummer: 'NAV 12-34.53' } as FormPropertiesType,
  } as Form,
  {
    path: 'nav123454',
    skjemanummer: 'NAV 12-34.54',
    title: 'En annen tittel 4',
    properties: { skjemanummer: 'NAV 12-34.54' } as FormPropertiesType,
  } as Form,
  {
    path: 'nav123455',
    skjemanummer: 'NAV 12-34.55',
    title: 'Femte tittel 5',
    properties: { skjemanummer: 'NAV 12-34.55' } as FormPropertiesType,
  } as Form,
];

export default forms;
