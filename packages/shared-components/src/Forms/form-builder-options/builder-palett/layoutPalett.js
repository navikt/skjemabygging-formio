const layoutPalett = {
  title: "Layout",
  components: {
    well: null,
    content: null,
    alertstripe: {
      title: "Alertstripe",
      key: "alertstripe",
      icon: "clipboard",
      weight: 2,
      group: "layout",
      documentation: "/userguide/#htmlelement",
      schema: {
        label: "Alertstripe",
        type: "alertstripe",
        key: "alertstripe",
        alerttype: "info",
        input: true,
        clearOnHide: true,
      },
    },
    fieldset: {
      ignore: true,
    },
    navSkjemagruppe: {
      documentation: "",
      group: "layout",
      icon: "th-large",
      key: "navSkjemagruppe",
      title: "Skjemagruppe",
      weight: 20,
      schema: {
        label: "Skjemagruppe",
        key: "navSkjemagruppe",
        type: "navSkjemagruppe",
        legend: "Skjemagruppe",
        components: [],
        input: false,
        persistent: false,
      },
    },
  },
};

export default layoutPalett;