const formComponentsMock = [
  {
    title: "Introduksjon",
    key: "introduksjon",
    properties: {},
    type: "panel",
    label: "Panel",
    components: [
      {
        label: "Content",
        key: "content",
        properties: {},
        type: "content",
      },
    ],
  },
  {
    title: "Personopplysninger",
    key: "panel",
    properties: {},
    type: "panel",
    label: "Panel",
    components: [
      {
        key: "fodselsnummerDNummer",
        type: "fnrfield",
        label: "Fødselsnummer / D-nummer",
        properties: {},
      },
      {
        label: "Fornavn",
        type: "textfield",
        key: "fornavn",
        properties: {},
      },
      {
        label: "Etternavn",
        type: "textfield",
        key: "etternavn",
        properties: {},
      },
      {
        label: "Bor du i Norge?",
        values: [
          { label: "Ja", value: "ja", shortcut: "" },
          { label: "Nei", value: "nei", shortcut: "" },
        ],
        key: "borDuINorge",
        properties: {},
        type: "radio",
      },
    ],
  },
  {
    title: "Vedlegg",
    key: "page5",
    properties: {},
    type: "panel",
    label: "Page 5",
    components: [
      {
        label: "HTML",
        content: "Vi trenger følgende dokumentasjon for å behandle søknaden din:\n<p></p>",
        key: "html2",
        properties: {},
        type: "htmlelement",
      },
      {
        label: "Skriftlig bekreftelse på studieplass",
        values: [
          { label: "Jeg legger det ved denne søknaden (anbefalt)", value: "leggerVedNaa", shortcut: "" },
          {
            label:
              "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
            value: "ettersender",
            shortcut: "",
          },
          { label: "Jeg har levert denne dokumentasjonen tidligere", value: "levertTidligere", shortcut: "" },
        ],
        key: "vedleggO9",
        properties: {
          vedleggstittel: "",
        },
        type: "radio",
      },
      {
        label: "Faktura fra utdanningsinstitusjon",
        values: [
          { label: "Jeg legger det ved denne søknaden (anbefalt)", value: "leggerVedNaa", shortcut: "" },
          {
            label:
              "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
            value: "ettersender",
            shortcut: "",
          },
          { label: "Jeg har levert denne dokumentasjonen tidligere", value: "sendtTidligere", shortcut: "" },
        ],
        key: "vedleggQ7",
        properties: {},
        type: "radio",
      },
    ],
  },
  {
    type: "button",
    label: "Submit",
    key: "submit",
  },
];
