const panelDiff = {
  title: 'Vedleggsliste',
  key: 'vedleggpanel1',
  type: 'panel',
  label: 'Vedlegg',
  components: [
    {
      status: 'Slettet',
      originalValue: {
        label: 'Bekreftelse på skoleplass',
        values: [
          {
            value: 'leggerVedNaa',
            label: 'Jeg legger det ved denne søknaden (anbefalt)',
            shortcut: '',
          },
          {
            value: 'ettersender',
            label:
              'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
            shortcut: '',
          },
          { value: 'levertTidligere', label: 'Jeg har levert denne dokumentasjonen tidligere', shortcut: '' },
        ],
        validate: {
          required: true,
          custom: '',
          customPrivate: false,
          strictDateValidation: false,
          multiple: false,
          unique: false,
          onlyAvailableItems: false,
        },
        key: 'bekreftelsePaSkoleplass1',
        properties: { vedleggstittel: 'Bekreftelse fra skole', vedleggskode: 'O9', vedleggErValgfritt: 'ja' },
        type: 'radiopanel',
        input: true,
        validateOn: 'blur',
        tableView: false,
        placeholder: '',
        prefix: '',
        customClass: '',
        suffix: '',
        multiple: false,
        defaultValue: null,
        protected: false,
        unique: false,
        persistent: true,
        hidden: false,
        clearOnHide: true,
        refreshOn: '',
        redrawOn: '',
        modalEdit: false,
        dataGridLabel: false,
        labelPosition: 'top',
        description: '',
        errorLabel: '',
        tooltip: '',
        hideLabel: false,
        tabindex: '',
        disabled: false,
        autofocus: false,
        dbIndex: false,
        customDefaultValue: '',
        calculateValue: '',
        calculateServer: false,
        widget: null,
        attributes: {},
        conditional: { show: null, when: null, eq: '' },
        overlay: { style: '', left: '', top: '', width: '', height: '' },
        allowCalculateOverride: false,
        encrypted: false,
        showCharCount: false,
        showWordCount: false,
        allowMultipleMasks: false,
        addons: [],
        inputType: 'radio',
        fieldSet: false,
        id: 'erg3rgt',
      },
    },
  ],
  id: 'eun8oti',
};

export default panelDiff;