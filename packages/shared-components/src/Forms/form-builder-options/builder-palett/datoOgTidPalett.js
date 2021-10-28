const datoOgTidPalett = {
  title: "Dato og tid",
  components: {
    datetime: null,
    datoVelger: {
      title: "Datovelger",
      group: "datoOgTid",
      icon: "calendar",
      input: true,
      schema: {
        type: "navDatepicker",
        label: "Dato (dd.mm.åååå)",
        dataGridLabel: true,
        validateOn: "blur",
        validate: {
          custom:
            "valid = instance.validateDatePicker(input, data," +
            "component.beforeDateInputKey, component.mayBeEqual, " +
            "component.earliestAllowedDate, component.latestAllowedDate);",
          required: true,
        },
      },
    },
    time: {
      title: "Klokke",
      key: "klokke",
      icon: "clock-o",
      weight: 20,
      schema: {
        label: "Tid",
        type: "time",
        key: "tid",
        fieldSize: "input--s",
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        clearOnHide: true,
        validateOn: "blur",
        validate: {
          required: true,
        },
      },
    },
    day: {
      title: "Mnd / år",
      key: "manedAr",
      icon: "calendar",
      weight: 40,
      schema: {
        label: "Mnd / år",
        type: "day",
        key: "manedAr",
        input: true,
        dataGridLabel: true,
        clearOnHide: true,
        validateOn: "blur",
        validate: {
          required: true,
        },
        fields: {
          day: {
            fieldSize: "input--xs",
            required: false,
            hide: true,
          },
          month: {
            fieldSize: "input--s",
            type: "select",
            placeholder: "month",
            required: true,
          },
          year: {
            fieldSize: "input--s",
            type: "number",
            placeholder: "year",
            required: true,
          },
        },
      },
    },
  },
};

export default datoOgTidPalett;