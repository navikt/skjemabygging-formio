import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

const legacyPersonalInformationKeys = [
  'fornavnSoker',
  'etternavnSoker',
  'coSoker',
  'postnummerSoker',
  'postnrSoker',
  'utenlandskPostkodeSoker',
  'poststedSoker',
  'landSoker',
  'gateadresseSoker',
  'norskVegadresse',
  'norskPostboksadresse',
  'utenlandskAdresse',
  'fodselsnummerDNummerSoker',
] as const;

const hasLegacyPersonalInformationLayout = (form: Form): boolean =>
  navFormUtils
    .flattenComponents(form.components)
    .some((component) =>
      legacyPersonalInformationKeys.includes(component.key as (typeof legacyPersonalInformationKeys)[number]),
    );

export { hasLegacyPersonalInformationLayout };
