export const PrefillType = {
  sokerFornavn: 'Søkers fornavn',
  sokerEtternavn: 'Søkers etternavn',
  sokerTelefonnummer: 'Søkers telefonnummer',
  sokerKjonn: 'Søkers kjønn',
} as const;

export type PrefillKey = keyof typeof PrefillType;

export type PrefillData = {
  sokerFornavn?: string;
  sokerEtternavn?: string;
  sokerTelefonnummer?: string;
  sokerKjonn?: string;
};
