const layoutPalett = {
  title: "Layout",
  components: {
    well: null,
    content: null,
    columns: {
      ignore: true,
    },
    table: {
      ignore: true,
    },
    tabs: {
      ignore: true,
    },
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

    row: {
      label: "Rad",
      key: "row",
      title: "Rad",
      icon: "th-large",
      schema: {
        title: "Rad",
        key: "rad",
        type: "row",
        components: [],
      },
    },
  },
};

export default layoutPalett;
