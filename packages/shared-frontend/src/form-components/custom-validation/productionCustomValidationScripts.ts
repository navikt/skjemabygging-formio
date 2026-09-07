import { Component } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Every distinct `validate.custom` in the published production forms, after whitespace and trailing
 * semicolons are normalized away: 14 scripts covering all 1371 occurrences, together with the
 * component configuration each of them was authored against.
 *
 * This is a snapshot, checked in on purpose: the tests must never reach for an external source.
 * Regenerate it from https://github.com/navikt/skjemautfylling-formio (forms/) when production
 * forms change, and extend the mapper for anything new it turns up.
 */
interface ProductionCustomValidationScript {
  occurrences: number;
  formCount: number;
  exampleForm: string;
  component: Component;
}

const productionCustomValidationScripts: ProductionCustomValidationScript[] = [
  {
    occurrences: 988,
    formCount: 106,
    exampleForm: 'nav020705',
    component: {
      key: 'fraDatoDdMmAaaa',
      type: 'navDatepicker',
      beforeDateInputKey: '',
      customConditional: '',
      validate: { custom: 'valid = instance.validateDatePickerV2(input, data, component, row);' },
    } as Component,
  },
  {
    occurrences: 171,
    formCount: 106,
    exampleForm: 'nav020705',
    component: {
      key: 'fodselsnummerDNummer',
      type: 'fnrfield',
      validate: { custom: 'valid = instance.validateFnrNew(input)' },
    } as Component,
  },
  {
    occurrences: 83,
    formCount: 41,
    exampleForm: 'nav020705',
    component: {
      key: 'orgNr',
      type: 'orgNr',
      validate: { custom: 'valid = instance.validateOrganizationNumber(input)' },
    } as Component,
  },
  {
    occurrences: 42,
    formCount: 23,
    exampleForm: 'nav060304',
    component: {
      key: 'fosterforeldersKontonummer',
      type: 'bankAccount',
      customConditional: '',
      validate: { custom: 'valid = instance.validateAccountNumber(input)' },
    } as Component,
  },
  {
    occurrences: 38,
    formCount: 8,
    exampleForm: 'nav060304',
    component: {
      key: 'fodselsdatoDdMmAaaaSoker',
      type: 'navDatepicker',
      validate: {
        custom:
          'valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate, row);',
      },
    } as Component,
  },
  {
    occurrences: 31,
    formCount: 7,
    exampleForm: 'nav040605',
    component: {
      key: 'fraDatoDdMmAaaa1',
      type: 'navDatepicker',
      beforeDateInputKey: '',
      customConditional: '',
      validate: {
        custom:
          'valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);',
      },
    } as Component,
  },
  {
    occurrences: 9,
    formCount: 5,
    exampleForm: 'nav170106',
    component: {
      key: 'iban',
      type: 'iban',
      customConditional:
        'show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",\r\n "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",\r\n"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",\r\n"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",\r\n"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",\r\n"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value);',
      validate: { custom: 'valid = instance.validateIban(input);' },
    } as Component,
  },
  {
    occurrences: 2,
    formCount: 1,
    exampleForm: 'nav040605',
    component: {
      key: 'jegVilFortsetteASokeJobbMensJegTarUtdanningSomKanKombineresMedUtdanningenMin',
      type: 'navCheckbox',
      customConditional:
        "show = ((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei'));",
      validate: {
        custom:
          "show = ((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei'));",
      },
    } as Component,
  },
  {
    occurrences: 2,
    formCount: 2,
    exampleForm: 'nav761380',
    component: {
      key: 'underenhetensOrganisasjonsnummer',
      type: 'textfield',
      customConditional: '',
      validate: {
        custom:
          "valid = (String(input) !== data.hovedenhetensOrganisasjonsnummer) ? true : 'Underenhet kan ikke være det samme som organisasjonsnummer.';",
      },
    } as Component,
  },
  {
    occurrences: 1,
    formCount: 1,
    exampleForm: 'nav040605',
    component: {
      key: 'jegVilFortsetteASokeJobbMensJegTarUtdanningEllerOpplaering',
      type: 'navCheckbox',
      customConditional:
        "show = !(((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei')));",
      validate: {
        custom:
          "show = !(((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei')));",
      },
    } as Component,
  },
  {
    occurrences: 1,
    formCount: 1,
    exampleForm: 'nav111221',
    component: {
      key: 'gateadresse',
      type: 'textfield',
      customConditional: '',
      validate: {
        custom:
          "valid = (input !== data.dineOpplysninger.adresse.adresse) ? true : 'Du har skrevet inn din egen hjemadresse. I dette feltet skal du fylle inn adressen til aktivitetens oppmøtested.';",
      },
    } as Component,
  },
  {
    occurrences: 1,
    formCount: 1,
    exampleForm: 'nav761381',
    component: {
      key: 'underenhet',
      type: 'textfield',
      customConditional: '',
      validate: {
        custom:
          "valid = (String(input) !== data.orgNr) ? true : 'Bedriftsnummer kan ikke være det samme som organisasjonsnummer.';",
      },
    } as Component,
  },
  {
    occurrences: 1,
    formCount: 1,
    exampleForm: 'nav761389',
    component: {
      key: 'underenhetensOrgNr',
      type: 'orgNr',
      customConditional: '',
      validate: {
        custom:
          "valid = instance.validateOrganizationNumber(input) && (String(input) !== data.hovedenhetensOrganisasjonsnummer) ? true : 'Underenhet kan ikke være det samme som hovedenhetens organisasjonsnummer.';",
      },
    } as Component,
  },
  {
    occurrences: 1,
    formCount: 1,
    exampleForm: 'nav951536',
    component: {
      key: 'tilDatoDdMmAaaa',
      type: 'navDatepicker',
      beforeDateInputKey: 'fraDatoDdMmAaaa',
      customConditional: '',
      validate: {
        custom:
          "var startday = new Date(row.fraDatoDdMmAaaa);\nvar endday = new Date(row.tilDatoDdMmAaaa);\nvar diffInTime = endday.getTime() - startday.getTime();\nvar diffInDays = diffInTime/ (1000 * 3600 * 24);\n\nif (endday<=startday)\n  {valid = ((endday>startday) ? true : 'Til dato må være større enn Fra dato');}\nelse \n  {if (diffInDays > 365)\n    {valid = ((diffInDays <= 365) ? true : 'Perioden kan være maksimalt ett år');}\n  }\n",
      },
    } as Component,
  },
];

export { productionCustomValidationScripts };
export type { ProductionCustomValidationScript };
