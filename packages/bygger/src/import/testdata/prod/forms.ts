import { FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

const forms: NavFormType[] = [
  {
    path: 'nav123451',
    title: 'Testskjema 1',
    properties: { skjemanummer: 'NAV 12-34.51' } as FormPropertiesType,
  } as NavFormType,
  {
    path: 'nav123452',
    title: 'Testskjema 2',
    properties: { skjemanummer: 'NAV 12-34.52' } as FormPropertiesType,
  } as NavFormType,
  {
    path: 'nav123453',
    title: 'Testskjema 3',
    properties: { skjemanummer: 'NAV 12-34.53' } as FormPropertiesType,
  } as NavFormType,
  {
    path: 'nav123454',
    title: 'En annen tittel 4',
    properties: { skjemanummer: 'NAV 12-34.54' } as FormPropertiesType,
  } as NavFormType,
  {
    path: 'nav123455',
    title: 'Femte tittel 5',
    properties: { skjemanummer: 'NAV 12-34.55' } as FormPropertiesType,
  } as NavFormType,
];

export default forms;
