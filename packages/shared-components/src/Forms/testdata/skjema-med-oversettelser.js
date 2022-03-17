const htmlComponent = {
  label: "HTML",
  content: "Her skal det stå litt informasjon om søknaden",
  key: "html",
  type: "htmlelement",
  id: "ecip4o",
};

const panelVeiledning = {
  type: "panel",
  key: "veiledning",
  title: "Veiledning",
  label: "Veiledning",
  labelPosition: "top",
  validateOn: "change",
  id: "jdh58d",
  breadcrumb: "default",
  components: [
    {
      key: "annenDokumentasjon",
      id: "eo3t76",
      inputType: "radio",
      type: "radiopanel",
      label: "Annen dokumentasjon",
      input: true,
      descriptionPosition: "",
      labelWidth: "",
      labelMargin: "",
      description: "Har du noen annen dokumentasjon du ønsker å legge ved?",
      values: [
        {
          value: "leggerVedNaa",
          label: "Ja, jeg legger det ved denne søknaden.",
          shortcut: "",
        },
        {
          value: "ettersender",
          label: "Jeg ettersender dokumentasjonen senere.",
          shortcut: "",
        },
        {
          value: "nei",
          label: "Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.",
          shortcut: "",
        },
      ],
    },
  ],
};

const panelVedleggsliste = {
  type: "panel",
  key: "vedleggpanel",
  title: "Vedleggsliste",
  label: "Vedlegg",
  labelPosition: "top",
  validateOn: "change",
  id: "jdh58e",
  breadcrumb: "default",
  components: [htmlComponent],
};

const form = {
  _id: "61405cb95dbf1200033aa272",
  type: "form",
  tags: ["nav-skjema", ""],
  owner: "606ea4ab852cf50003ac20d3",
  components: [panelVeiledning, panelVedleggsliste],
  display: "wizard",
  name: "wip123456",
  title: "Søknad om førerhund",
  path: "wip123456",
  properties: {
    skjemanummer: "WIP 12.34-56",
    tema: "VEN",
    hasPapirInnsendingOnly: true,
    hasLabeledSignatures: false,
  },
  machineName: "wip123456",
};

const translations = {
  en: {
    id: "1",
    translations: {
      [`${form.title}`]: { scope: "local", value: "Application for guide dog" },
      [`${panelVeiledning.label}`]: { scope: "local", value: "Guidance" },
      [`${htmlComponent.content}`]: { scope: "local", value: "Some information about the application" },
      Avbryt: { scope: "global", value: "Cancel" },
      Neste: { scope: "global", value: "Next" },
    },
  },
  "nn-NO": {
    id: "2",
    translations: {
      [`${form.title}`]: { scope: "local", value: "Søknad om førarhund" },
      [`${panelVeiledning.label}`]: { scope: "local", value: "Veiledning" },
      [`${htmlComponent.content}`]: { scope: "local", value: "Her kjem det til å stå litt om søknaden" },
    },
  },
};

const translationsForNavForm = {
  en: {
    [`${form.title}`]: "Application for guide dog",
    [`${panelVeiledning.label}`]: "Guidance",
    [`${htmlComponent.content}`]: "Some information about the application",
    Avbryt: "Cancel",
    Neste: "Next",
  },
  "nn-NO": {
    [`${form.title}`]: "Søknad om førarhund",
    [`${panelVeiledning.label}`]: "Veiledning",
    [`${htmlComponent.content}`]: "Her kjem det til å stå litt om søknaden",
  },
};

export { form, translations, translationsForNavForm };
