const form = {
  _id: { $oid: '123456789' },
  type: 'form',
  tags: ['nav-skjema', ''],
  deleted: null,
  owner: { $oid: '987654321' },
  components: [
    {
      title: 'Steg 1',
      labelWidth: '',
      labelMargin: '',
      theme: 'default',
      breadcrumb: 'default',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true,
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      tooltip: '',
      customClass: '',
      collapsible: false,
      hidden: false,
      hideLabel: false,
      disabled: false,
      modalEdit: false,
      key: 'veiledning',
      tags: [],
      properties: {},
      customConditional: '',
      conditional: {
        json: '',
        show: null,
        when: null,
        eq: '',
      },
      nextPage: '',
      logic: [],
      attributes: {},
      overlay: {
        style: '',
        page: '',
        left: '',
        top: '',
        width: '',
        height: '',
      },
      addons: [],
      type: 'panel',
      label: 'Panel',
      tabindex: '',
      input: false,
      components: [
        {
          label: 'Har du en yndlingsfarge?',
          descriptionPosition: '',
          labelWidth: '',
          labelMargin: '',
          description: '',
          hideLabel: false,
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          validate: {
            required: false,
            customMessage: '',
            custom: '',
            customPrivate: false,
            json: '',
            strictDateValidation: false,
            multiple: false,
            unique: false,
          },
          errorLabel: '',
          errors: '',
          key: 'harDuEnYndlingsfarge',
          tags: [],
          properties: {},
          conditional: {
            show: null,
            when: null,
            eq: '',
            json: '',
          },
          customConditional: '',
          addons: [],
          type: 'navCheckbox',
          name: '',
          value: '',
          input: true,
          validateOn: 'blur',
          placeholder: '',
          prefix: '',
          customClass: '',
          suffix: '',
          multiple: false,
          protected: false,
          unique: false,
          persistent: true,
          hidden: false,
          refreshOn: '',
          redrawOn: '',
          tableView: false,
          modalEdit: false,
          dataGridLabel: true,
          labelPosition: 'right',
          tooltip: '',
          tabindex: '',
          disabled: false,
          autofocus: false,
          dbIndex: false,
          calculateServer: false,
          widget: null,
          attributes: {},
          overlay: {
            style: '',
            left: '',
            top: '',
            width: '',
            height: '',
          },
          allowCalculateOverride: false,
          encrypted: false,
          showCharCount: false,
          showWordCount: false,
          allowMultipleMasks: false,
          inputType: 'checkbox',
          id: 'ekoo75nf',
          defaultValue: false,
        },
        {
          label: 'Oppgi yndlingsfarge',
          fieldSize: 'input--xxl',
          descriptionPosition: '',
          labelWidth: '',
          labelMargin: '',
          description: '',
          prefix: '',
          suffix: '',
          widget: {
            type: 'input',
          },
          displayMask: '',
          autocomplete: '',
          showWordCount: false,
          showCharCount: false,
          mask: false,
          spellcheck: true,
          disabled: false,
          truncateMultipleSpaces: false,
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          validateOn: 'blur',
          validate: {
            required: true,
            minLength: '',
            maxLength: '',
            minWords: '',
            maxWords: '',
            pattern: '',
            customMessage: '',
            custom: '',
            customPrivate: false,
            json: '',
            strictDateValidation: false,
            multiple: false,
            unique: false,
          },
          errorLabel: '',
          errors: '',
          key: 'oppgiYndlingsfarge',
          tags: [],
          properties: {},
          conditional: {
            show: true,
            when: 'harDuEnYndlingsfarge',
            eq: 'ja',
            json: '',
          },
          customConditional: '',
          addons: [],
          type: 'textfield',
          input: true,
          dataGridLabel: true,
          placeholder: '',
          customClass: '',
          multiple: false,
          protected: false,
          unique: false,
          persistent: true,
          hidden: false,
          refreshOn: '',
          redrawOn: '',
          tableView: true,
          modalEdit: false,
          labelPosition: 'top',
          tooltip: '',
          hideLabel: false,
          tabindex: '',
          autofocus: false,
          dbIndex: false,
          calculateServer: false,
          attributes: {},
          overlay: {
            style: '',
            left: '',
            top: '',
            width: '',
            height: '',
          },
          allowCalculateOverride: false,
          encrypted: false,
          allowMultipleMasks: false,
          inputType: 'text',
          inputFormat: 'plain',
          inputMask: '',
          id: 'ec464ka',
          defaultValue: '',
        },
      ],
      tableView: false,
      placeholder: '',
      prefix: '',
      suffix: '',
      multiple: false,
      defaultValue: null,
      protected: false,
      unique: false,
      persistent: false,
      clearOnHide: false,
      refreshOn: '',
      redrawOn: '',
      dataGridLabel: false,
      labelPosition: 'top',
      description: '',
      errorLabel: '',
      autofocus: false,
      dbIndex: false,
      customDefaultValue: '',
      calculateValue: '',
      calculateServer: false,
      widget: null,
      validateOn: 'change',
      validate: {
        required: false,
        custom: '',
        customPrivate: false,
        strictDateValidation: false,
        multiple: false,
        unique: false,
      },
      allowCalculateOverride: false,
      encrypted: false,
      showCharCount: false,
      showWordCount: false,
      allowMultipleMasks: false,
      tree: false,
      lazyLoad: false,
      id: 'eulpia6',
    },
  ],
  display: 'wizard',
  name: 'wip101116',
  title: 'Testskjema for conditionals',
  path: 'wip101116',
  properties: {
    skjemanummer: 'WIP 10-11.16',
    tema: 'CON',
    innsending: 'PAPIR_OG_DIGITAL',
    hasLabeledSignatures: false,
    signatures: {
      signature1: '',
      signature2: '',
      signature3: '',
      signature4: '',
      signature5: '',
    },
  },
  machineName: 'wip101116',
};

export default form;
