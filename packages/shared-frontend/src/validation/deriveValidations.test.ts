import { Component, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { deriveValidations } from './deriveValidations';

describe('deriveValidations', () => {
  it('builds descriptors only for input components with rules', () => {
    const components = [
      { key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } },
      { key: 'noRules', label: 'NoRules', input: true, type: 'textfield', validate: {} },
      { key: 'panel', input: false, type: 'panel' },
    ] as unknown as Component[];

    const result = deriveValidations(components);

    expect(result).toEqual([
      { submissionPath: 'name', field: 'Name', rules: { required: true, minLength: undefined, maxLength: undefined } },
    ]);
  });

  it('ignores empty-string lengths from form-builder defaults', () => {
    const components = [
      {
        key: 'a',
        label: 'A',
        input: true,
        type: 'textfield',
        validate: { required: true, maxLength: '', minLength: '' },
      },
    ] as unknown as Component[];
    expect(deriveValidations(components)[0].rules).toEqual({
      required: true,
      minLength: undefined,
      maxLength: undefined,
    });
  });

  it('falls back to key when label is missing', () => {
    const components = [
      { key: 'email', input: true, type: 'textfield', validate: { maxLength: 5 } },
    ] as unknown as Component[];
    expect(deriveValidations(components)[0].field).toBe('email');
  });

  it('uses nested submission paths for tree parents', () => {
    const components = [
      {
        key: 'container',
        type: 'container',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } }],
      },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'container.name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
    ]);
  });

  it('expands datagrid child validations per row', () => {
    const components = [
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } }],
      },
    ] as unknown as Component[];

    expect(deriveValidations(components, { data: { grid: [{ name: '' }, { name: 'Ada' }] } })).toEqual([
      {
        submissionPath: 'grid[0].name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
      {
        submissionPath: 'grid[1].name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
    ]);
  });

  it('derives validation for the default rendered datagrid row when submission is untouched', () => {
    const components = [
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', input: true, type: 'textfield', validate: { required: true } }],
      },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'grid[0].name',
        field: 'Name',
        rules: { required: true, minLength: undefined, maxLength: undefined },
      },
    ]);
  });

  it('adds simple email and number validation rules from component type', () => {
    const components = [
      { key: 'email', label: 'Email', input: true, type: 'email', validate: { required: true } },
      { key: 'amount', label: 'Amount', input: true, type: 'number', inputType: 'numeric', validate: { min: 1 } },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'email',
        field: 'Email',
        rules: {
          required: true,
          minLength: undefined,
          maxLength: undefined,
          email: true,
          coverPageValue: undefined,
          numberType: undefined,
          min: undefined,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
        },
      },
      {
        submissionPath: 'amount',
        field: 'Amount',
        rules: {
          required: undefined,
          minLength: undefined,
          maxLength: undefined,
          email: undefined,
          coverPageValue: undefined,
          numberType: 'integer',
          min: 1,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
        },
      },
    ]);
  });

  it('adds datepicker and month picker rules from component settings', () => {
    const components = [
      {
        key: 'fromDate',
        label: 'From date',
        input: true,
        type: 'navDatepicker',
        validate: { required: true },
        specificEarliestAllowedDate: '2024-01-01',
        specificLatestAllowedDate: '2024-12-31',
      },
      {
        key: 'month',
        label: 'Month',
        input: true,
        type: 'monthPicker',
        validate: { minYear: 2020, maxYear: 2025 },
      },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'fromDate',
        field: 'From date',
        rules: {
          required: true,
          minLength: undefined,
          maxLength: undefined,
          email: undefined,
          coverPageValue: undefined,
          numberType: undefined,
          min: undefined,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
          date: true,
          fromDate: '2024-01-01',
          toDate: '2024-12-31',
          month: undefined,
          monthMinYear: undefined,
          monthMaxYear: undefined,
        },
      },
      {
        submissionPath: 'month',
        field: 'Month',
        rules: {
          required: undefined,
          minLength: undefined,
          maxLength: undefined,
          email: undefined,
          coverPageValue: undefined,
          numberType: undefined,
          min: undefined,
          max: undefined,
          year: undefined,
          minYear: 2020,
          maxYear: 2025,
          date: undefined,
          fromDate: undefined,
          toDate: undefined,
          month: true,
          monthMinYear: 2020,
          monthMaxYear: 2025,
        },
      },
    ]);
  });

  it('adds organization number validation rule from component type', () => {
    const components = [{ key: 'orgnr', label: 'Organization number', input: true, type: 'orgNr' }] as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'orgnr',
        field: 'Organization number',
        rules: {
          required: undefined,
          minLength: undefined,
          maxLength: undefined,
          email: undefined,
          coverPageValue: undefined,
          numberType: undefined,
          min: undefined,
          max: undefined,
          year: undefined,
          minYear: undefined,
          maxYear: undefined,
          date: undefined,
          fromDate: undefined,
          toDate: undefined,
          month: undefined,
          monthMinYear: undefined,
          monthMaxYear: undefined,
          organizationNumber: true,
        },
      },
    ]);
  });

  it('adds account number and iban validation rules from component type', () => {
    const components = [
      { key: 'account', label: 'Account number', input: true, type: 'bankAccount' },
      { key: 'iban', label: 'IBAN', input: true, type: 'iban' },
    ] as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'account',
        field: 'Account number',
        rules: expect.objectContaining({ accountNumber: true }),
      },
      {
        submissionPath: 'iban',
        field: 'IBAN',
        rules: expect.objectContaining({ iban: true }),
      },
    ]);
  });

  it('expands phoneNumber with area code into the nested number field', () => {
    const components = [
      {
        key: 'phone',
        label: 'Phone',
        input: true,
        type: 'phoneNumber',
        showAreaCode: true,
        validate: { required: true },
      },
    ] as unknown as Component[];

    expect(deriveValidations(components, { data: { phone: { areaCode: '+47', number: '12345678' } } })).toEqual([
      {
        submissionPath: 'phone.number',
        field: 'Phone',
        rules: {
          required: true,
          minLength: undefined,
          maxLength: undefined,
          phoneNumber: { showAreaCode: true, areaCode: '+47' },
        },
      },
    ]);
  });

  it('keeps phoneNumber without area code on the root submission path', () => {
    const components = [{ key: 'phone', label: 'Phone', input: true, type: 'phoneNumber' }] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'phone',
        field: 'Phone',
        rules: {
          required: undefined,
          minLength: undefined,
          maxLength: undefined,
          phoneNumber: { showAreaCode: false },
        },
      },
    ]);
  });

  it('expands identity into radio + national-identity-number when identity number is chosen', () => {
    const components = [
      { key: 'identity', type: 'identity', input: true, validate: { required: true } },
    ] as unknown as Component[];

    const result = deriveValidations(components, { data: { identity: { harDuFodselsnummer: 'ja' } } });

    expect(result).toEqual([
      { submissionPath: 'identity.harDuFodselsnummer', field: expect.any(String), rules: { required: true } },
      {
        submissionPath: 'identity.identitetsnummer',
        field: expect.any(String),
        rules: { required: true, nationalIdentityNumber: true },
      },
    ]);
  });

  it('expands identity into radio + birthdate when no identity number is chosen', () => {
    const components = [
      { key: 'identity', type: 'identity', input: true, validate: { required: true } },
    ] as unknown as Component[];

    const result = deriveValidations(components, { data: { identity: { harDuFodselsnummer: 'nei' } } });

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      submissionPath: 'identity.fodselsdato',
      rules: { required: true, date: true, fromDate: '1900-01-01' },
    });
  });

  it('only validates the identity radio until an option is chosen', () => {
    const components = [
      { key: 'identity', type: 'identity', input: true, validate: { required: true } },
    ] as unknown as Component[];

    const result = deriveValidations(components, { data: { identity: {} } });

    expect(result).toEqual([
      { submissionPath: 'identity.harDuFodselsnummer', field: expect.any(String), rules: { required: true } },
    ]);
  });

  it('uses customLabels.doYouHaveIdentityNumber for the identity radio descriptor', () => {
    const components = [
      {
        key: 'identity',
        label: 'Identitet',
        type: 'identity',
        input: true,
        validate: { required: true },
        customLabels: { doYouHaveIdentityNumber: 'Har du et gyldig identitetsdokument?' },
      },
    ] as unknown as Component[];

    const result = deriveValidations(components, { data: { identity: {} } });

    expect(result).toEqual([
      {
        submissionPath: 'identity.harDuFodselsnummer',
        field: 'Har du et gyldig identitetsdokument?',
        rules: { required: true },
      },
    ]);
  });

  it('expands address into its visible nested fields for wizard choice and norwegian inputs', () => {
    const components = [
      {
        key: 'address',
        type: 'navAddress',
        input: true,
        validate: { required: true },
        addressTypeWizard: 'user',
      },
    ] as unknown as Component[];

    const result = deriveValidations(
      components,
      { data: { address: { borDuINorge: 'ja', vegadresseEllerPostboksadresse: 'vegadresse' } } },
      'paper',
    );

    expect(result).toEqual([
      { submissionPath: 'address.borDuINorge', field: expect.any(String), rules: { required: true } },
      {
        submissionPath: 'address.vegadresseEllerPostboksadresse',
        field: expect.any(String),
        rules: { required: true },
      },
      {
        submissionPath: 'address.co',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.adresse',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
      {
        submissionPath: 'address.postnummer',
        field: expect.any(String),
        rules: { required: true, postalCode: true },
      },
      {
        submissionPath: 'address.bySted',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
    ]);
  });

  it('expands address into foreign-address fields for paper address choice', () => {
    const components = [
      {
        key: 'address',
        type: 'navAddress',
        input: true,
        validate: { required: true },
        prefillKey: 'sokerAdresser',
      },
    ] as unknown as Component[];

    const result = deriveValidations(components, { data: { address: { borDuINorge: 'nei' } } }, 'paper');

    expect(result).toEqual([
      { submissionPath: 'address.borDuINorge', field: expect.any(String), rules: { required: true } },
      {
        submissionPath: 'address.co',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.adresse',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
      {
        submissionPath: 'address.bygning',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.postnummer',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.bySted',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.region',
        field: expect.any(String),
        rules: { coverPageValue: true },
      },
      {
        submissionPath: 'address.land',
        field: expect.any(String),
        rules: { required: true },
      },
    ]);
  });

  it('expands address validity into nested from/to date fields', () => {
    const components = [
      { key: 'addressValidity', type: 'addressValidity', input: true, validate: { required: true } },
    ] as unknown as Component[];

    expect(
      deriveValidations(components, {
        data: { addressValidity: { gyldigFraOgMed: '2024-01-10' } },
      }),
    ).toEqual([
      {
        submissionPath: 'addressValidity.gyldigFraOgMed',
        field: expect.any(String),
        rules: expect.objectContaining({ required: true, date: true }),
      },
      {
        submissionPath: 'addressValidity.gyldigTilOgMed',
        field: expect.any(String),
        rules: expect.objectContaining({ date: true, fromDate: '2024-01-10' }),
      },
    ]);
  });

  it('skips hidden conditional nested fields in your information', () => {
    const components = [
      {
        key: 'dineOpplysninger',
        type: 'container',
        yourInformation: true,
        components: [
          {
            key: 'addressValidity',
            type: 'addressValidity',
            input: true,
            validate: { required: true },
            customConditional:
              'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
          },
        ],
      },
    ] as unknown as Component[];

    expect(
      deriveValidations(components, {
        data: {
          dineOpplysninger: {
            adresse: {
              adresse: 'Testveien 1C',
              postnummer: '1234',
              bySted: 'Plassen',
              landkode: 'NOR',
            },
          },
        },
      } as Submission),
    ).toEqual([]);
  });

  it('expands sender person fields into nested descriptors', () => {
    const components = [
      { key: 'sender', type: 'sender', input: true, validate: { required: true } },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'sender.person.nationalIdentityNumber',
        field: expect.any(String),
        rules: { required: true, nationalIdentityNumber: true },
      },
      {
        submissionPath: 'sender.person.firstName',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
      {
        submissionPath: 'sender.person.surname',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
    ]);
  });

  it('expands sender organization fields into nested descriptors', () => {
    const components = [
      { key: 'sender', type: 'sender', input: true, senderRole: 'organization', validate: { required: true } },
    ] as unknown as Component[];

    expect(deriveValidations(components)).toEqual([
      {
        submissionPath: 'sender.organization.number',
        field: expect.any(String),
        rules: { required: true, organizationNumber: true },
      },
      {
        submissionPath: 'sender.organization.name',
        field: expect.any(String),
        rules: { required: true, coverPageValue: true },
      },
    ]);
  });

  it('marks activities as required', () => {
    const components = [
      { key: 'aktivitet', type: 'activities', input: true, label: 'Aktivitet' },
    ] as unknown as Component[];

    expect(deriveValidations(components, undefined, 'digital')).toEqual([
      {
        submissionPath: 'aktivitet',
        field: 'Aktivitet',
        rules: expect.objectContaining({ required: true }),
      },
    ]);
  });

  it('validates required dataFetcher only when fetch metadata succeeded', () => {
    const components = [
      {
        key: 'aktivitetsvelger',
        type: 'dataFetcher',
        input: true,
        label: 'Aktivitetsvelger',
        validate: { required: true },
      },
    ] as unknown as Component[];
    const submission = {
      data: {},
      metadata: {
        dataFetcher: {
          aktivitetsvelger: {
            data: [{ value: 'a1', label: 'Aktivitet 1' }],
          },
        },
      },
    } as unknown as Submission;

    expect(deriveValidations(components, submission, 'digital')).toEqual([
      {
        submissionPath: 'aktivitetsvelger',
        field: 'Aktivitetsvelger',
        rules: expect.objectContaining({ required: true, dataFetcherSelection: true }),
      },
    ]);
  });

  it('skips required dataFetcher validation when fetch failed or was disabled', () => {
    const components = [
      {
        key: 'aktivitetsvelger',
        type: 'dataFetcher',
        input: true,
        label: 'Aktivitetsvelger',
        validate: { required: true },
      },
    ] as unknown as Component[];

    expect(
      deriveValidations(
        components,
        {
          data: {},
          metadata: { dataFetcher: { aktivitetsvelger: { data: [] } } },
        } as unknown as Submission,
        'digital',
      ),
    ).toEqual([]);

    expect(
      deriveValidations(
        components,
        {
          data: {},
          metadata: { dataFetcher: { aktivitetsvelger: { fetchError: true } } },
        } as unknown as Submission,
        'digital',
      ),
    ).toEqual([]);

    expect(
      deriveValidations(
        components,
        {
          data: {},
          metadata: { dataFetcher: { aktivitetsvelger: { fetchDisabled: true } } },
        } as unknown as Submission,
        'paper',
      ),
    ).toEqual([]);
  });

  it('adds paper drivinglist descriptors for date, parking, dates and parking inputs', () => {
    const components = [
      { key: 'drivinglist', type: 'drivinglist', input: true, label: 'Kjoreliste' },
    ] as unknown as Component[];

    expect(
      deriveValidations(
        components,
        {
          data: {
            drivinglist: {
              selectedDate: '2024-01-12',
              parking: true,
              dates: [{ date: '2024-01-12', parking: '50' }],
            },
          },
        } as unknown as Submission,
        'paper',
      ),
    ).toEqual([
      expect.objectContaining({
        submissionPath: 'drivinglist.selectedDate',
        field: TEXTS.statiske.drivingList.datePicker,
      }),
      expect.objectContaining({ submissionPath: 'drivinglist.parking', field: TEXTS.statiske.drivingList.parking }),
      expect.objectContaining({ submissionPath: 'drivinglist.dates', field: TEXTS.statiske.drivingList.dateSelect }),
      expect.objectContaining({
        submissionPath: 'drivinglist.dates[0].parking',
        field: TEXTS.statiske.drivingList.parkingExpenses,
        rules: expect.objectContaining({
          drivingListParkingExpense: { date: '2024-01-12', enforceMaxHundred: false },
        }),
      }),
    ]);
  });

  it('adds digital drivinglist descriptors for activity, dates and parking max validation', () => {
    const components = [
      { key: 'drivinglist', type: 'drivinglist', input: true, label: 'Kjoreliste' },
    ] as unknown as Component[];

    expect(
      deriveValidations(
        components,
        {
          data: {
            drivinglist: {
              selectedVedtaksId: 'vedtak-1',
              dates: [{ date: '2024-01-12', parking: '150', betalingsplanId: 'p1' }],
            },
          },
        } as unknown as Submission,
        'digital',
      ),
    ).toEqual([
      expect.objectContaining({
        submissionPath: 'drivinglist.selectedVedtaksId',
        field: TEXTS.statiske.activities.label,
      }),
      expect.objectContaining({
        submissionPath: 'drivinglist.dates',
        field: TEXTS.statiske.drivingList.dateSelect,
      }),
      expect.objectContaining({
        submissionPath: 'drivinglist.dates[0].parking',
        rules: expect.objectContaining({
          drivingListParkingExpense: { date: '2024-01-12', enforceMaxHundred: true },
        }),
      }),
    ]);
  });
});
