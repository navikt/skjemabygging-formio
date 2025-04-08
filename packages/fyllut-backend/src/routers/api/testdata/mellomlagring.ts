export const innsendingsId = '12345678-1234-1234-1234-12345678abcd';

export const requestBody = {
  innsendingsId: '95fd632d-8a09-4b58-aefa-07ca3b8b2273',
  form: {
    _id: '64e73d49afdb6ff7c0196270',
    title: 'Mellomlagring',
    name: 'nav999999',
    path: 'nav999999',
    components: [
      {
        title: 'Dine opplysninger',
        type: 'panel',
        input: false,
        key: 'personopplysninger',
        components: [
          {
            label: 'Fornavn',
            type: 'textfield',
            key: 'fornavnSoker',
            input: true,
            id: 'eggmhbi',
            navId: 'ekllqag',
          },
          {
            label: 'Etternavn',
            type: 'textfield',
            key: 'etternavnSoker',
            input: true,
            id: 'ecc9zph',
            navId: 'ei5ul7b',
          },
        ],
        id: 'e4vm4go',
        navId: 'e9la3po',
      },
      {
        title: 'Vedlegg',
        type: 'panel',
        input: false,
        key: 'vedlegg',
        isAttachmentPanel: true,
        components: [
          {
            label: 'Annen dokumentasjon',
            key: 'annenDokumentasjon',
            otherDocumentation: true,
            properties: { vedleggstittel: 'Annet', vedleggskode: 'N6' },
            values: [
              {
                value: 'nei',
                label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.',
              },
              { value: 'leggerVedNaa', label: 'Ja, jeg legger det ved denne søknaden.' },
              {
                value: 'ettersender',
                label: 'Jeg ettersender dokumentasjonen senere.',
              },
            ],
            id: 'ezh0do4',
            navId: 'ebrfmp',
          },
          {
            label: 'Oppmøtebekreftelse',
            values: [
              {
                value: 'leggerVedNaa',
                label: 'Jeg legger det ved denne søknaden (anbefalt)',
                shortcut: '',
              },
              {
                value: 'ettersender',
                label:
                  'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
                shortcut: '',
              },
              { value: 'levertTidligere', label: 'Jeg har levert denne dokumentasjonen tidligere', shortcut: '' },
            ],
            key: 'oppmotebekreftelse',
            properties: { vedleggstittel: 'Bekreftelse på oppmøte', vedleggskode: 'M2' },
            id: 'ez5vv0v',
            navId: 'eijyzy',
          },
          {
            label: 'Bekreftelse på at du av helsemessige årsaker må benytte dyrere transport',
            values: [
              {
                value: 'leggerVedNaa',
                label: 'Jeg legger det ved denne søknaden (anbefalt)',
                shortcut: '',
              },
              {
                value: 'ettersender',
                label:
                  'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
                shortcut: '',
              },
              { value: 'levertTidligere', label: 'Jeg har levert denne dokumentasjonen tidligere', shortcut: '' },
            ],
            key: 'bekreftelsePaAtDuAvHelsemessigeArsakerMaBenytteDyrereTransport',
            properties: { vedleggstittel: ' Dokumentasjon av behov for dyrere transportmiddel', vedleggskode: 'M4' },
            id: 'eqdukn',
            navId: 'e3dw1sg',
          },
        ],
        id: 'eog3hr',
        navId: 'e4fmriw',
      },
    ],
    properties: {
      skjemanummer: 'NAV 99-99.99',
      tema: 'AGR',
      innsending: 'PAPIR_OG_DIGITAL',
      ettersending: 'PAPIR_OG_DIGITAL',
    },
  },
  submission: { data: { fornavnSoker: 'Kalle', etternavnSoker: 'Hansen' } },
  language: 'nb-NO',
  translation: {},
  submissionMethod: 'digital',
};

export const sendInnResponseBody = {
  brukerId: '19876898104',
  skjemanr: 'NAV 99-99.99',
  tittel: 'Mellomlagring',
  tema: 'AGR',
  spraak: 'nb',
  hoveddokument: {
    vedleggsnr: 'NAV 99-99.99',
    tittel: 'Mellomlagring',
    label: 'Mellomlagring',
    pakrevd: true,
    beskrivelse: null,
    mimetype: 'application/pdf',
    document: null,
    propertyNavn: null,
    formioId: null,
  },
  hoveddokumentVariant: {
    vedleggsnr: 'NAV 99-99.99',
    tittel: 'Mellomlagring',
    label: 'Mellomlagring',
    pakrevd: false,
    beskrivelse: null,
    mimetype: 'application/json',
    document:
      'eyJsYW5ndWFnZSI6Im5iLU5PIiwiZGF0YSI6eyJkYXRhIjp7ImZvcm5hdm5Tb2tlciI6IkthbGxlIiwiZXR0ZXJuYXZuU29rZXIiOiJIYW5zZW4ifSwibWV0YWRhdGEiOnsidGltZXpvbmUiOiJFdXJvcGUvT3NsbyIsIm9mZnNldCI6MTIwLCJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJyZWZlcnJlciI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMS9meWxsdXQvbmF2OTk5OTk5IiwiYnJvd3Nlck5hbWUiOiJOZXRzY2FwZSIsInVzZXJBZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMTYuMC4wLjAgU2FmYXJpLzUzNy4zNiIsInBhdGhOYW1lIjoiL2Z5bGx1dC9uYXY5OTk5OTkvcGVyc29ub3BwbHlzbmluZ2VyIiwib25MaW5lIjp0cnVlfSwic3RhdGUiOiJzdWJtaXR0ZWQifX0=',
    propertyNavn: null,
    formioId: null,
  },
  innsendingsId: '95fd632d-8a09-4b58-aefa-07ca3b8b2273',
  status: 'Opprettet',
  vedleggsListe: [],
  kanLasteOppAnnet: true,
  fristForEttersendelse: 14,
  endretDato: '2023-08-24T11:28:51.854038+02:00',
};

export const decodedResponseBody = {
  brukerId: '19876898104',
  skjemanr: 'NAV 99-99.99',
  tittel: 'Mellomlagring',
  tema: 'AGR',
  spraak: 'nb',
  hoveddokument: {
    vedleggsnr: 'NAV 99-99.99',
    tittel: 'Mellomlagring',
    label: 'Mellomlagring',
    pakrevd: true,
    beskrivelse: null,
    mimetype: 'application/pdf',
    document: null,
    propertyNavn: null,
    formioId: null,
  },
  hoveddokumentVariant: {
    vedleggsnr: 'NAV 99-99.99',
    tittel: 'Mellomlagring',
    label: 'Mellomlagring',
    pakrevd: false,
    beskrivelse: null,
    mimetype: 'application/json',
    document: {
      language: 'nb-NO',
      data: {
        data: {
          fornavnSoker: 'Kalle',
          etternavnSoker: 'Hansen',
        },
        metadata: {
          timezone: 'Europe/Oslo',
          offset: 120,
          origin: 'http://localhost:3001',
          referrer: 'http://localhost:3001/fyllut/nav999999',
          browserName: 'Netscape',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
          pathName: '/fyllut/nav999999/personopplysninger',
          onLine: true,
        },
        state: 'submitted',
      },
    },
    propertyNavn: null,
    formioId: null,
  },
  innsendingsId: '95fd632d-8a09-4b58-aefa-07ca3b8b2273',
  status: 'Opprettet',
  vedleggsListe: [],
  kanLasteOppAnnet: true,
  fristForEttersendelse: 14,
  endretDato: '2023-08-24T11:28:51.854038+02:00',
};
