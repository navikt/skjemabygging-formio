const submissionKjokken = {
  data: {
    eierEllerLeierDuBoligenDuBorI: 'eier',
    hvilketRomGjelderDet: 'kjokken',
    annenDokumentasjon: 'nei',
  },
};

const submissionBad = {
  data: {
    eierEllerLeierDuBoligenDuBorI: 'eier',
    hvilketRomGjelderDet: 'bad',
    annenDokumentasjon: 'nei',
    containerBad: {},
  },
};

const submissionStue = {
  data: {
    eierEllerLeierDuBoligenDuBorI: 'eier',
    hvilketRomGjelderDet: 'stue',
    annenDokumentasjon: 'nei',
    containerStue: {},
  },
};

const form = {
  title: 'Container conditional',
  name: 'testAk002',
  path: 'testak002',
  type: 'form',
  display: 'wizard',
  tags: ['nav-skjema', ''],
  submissionAccess: [],
  owner: '123456789',
  components: [
    {
      title: 'Steg 1',
      labelWidth: '',
      labelMargin: '',
      theme: 'default',
      breadcrumb: 'default',
      breadcrumbClickable: true,
      buttonSettings: { previous: true, cancel: true, next: true },
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
      key: 'steg1',
      tags: [],
      properties: {},
      customConditional: '',
      conditional: { json: '', show: null, when: null, eq: '' },
      nextPage: '',
      logic: [],
      attributes: {},
      overlay: { style: '', page: '', left: '', top: '', width: '', height: '' },
      addons: [],
      type: 'panel',
      label: 'Panel',
      tabindex: '',
      input: false,
      tableView: false,
      components: [
        {
          label: 'Eier eller leier du boligen du bor i?',
          labelWidth: '',
          labelMargin: '',
          description: '',
          descriptionPosition: '',
          additionalDescription: false,
          values: [
            { value: 'eier', label: 'Eier', shortcut: '' },
            {
              value: 'leier',
              label: 'Leier',
              shortcut: '',
            },
          ],
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          validate: {
            required: true,
            onlyAvailableItems: false,
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
          key: 'eierEllerLeierDuBoligenDuBorI',
          tags: [],
          properties: {},
          conditional: { show: null, when: null, eq: '', json: '' },
          customConditional: '',
          addons: [],
          type: 'radiopanel',
          input: true,
          dataGridLabel: true,
          validateOn: 'blur',
          tableView: false,
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
          modalEdit: false,
          labelPosition: 'top',
          tooltip: '',
          hideLabel: false,
          tabindex: '',
          disabled: false,
          autofocus: false,
          dbIndex: false,
          calculateServer: false,
          widget: null,
          attributes: {},
          overlay: { style: '', left: '', top: '', width: '', height: '' },
          allowCalculateOverride: false,
          encrypted: false,
          showCharCount: false,
          showWordCount: false,
          allowMultipleMasks: false,
          inputType: 'radio',
          fieldSet: false,
          id: 'e7ns3ua',
          defaultValue: '',
        },
        {
          label: 'Hvilket rom gjelder det?',
          labelWidth: '',
          labelMargin: '',
          description: '',
          descriptionPosition: '',
          additionalDescription: false,
          values: [
            { value: 'bad', label: 'Bad', shortcut: '' },
            {
              value: 'kjokken',
              label: 'Kjøkken',
              shortcut: '',
            },
            { label: 'Stue', value: 'stue', shortcut: '' },
          ],
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          validate: {
            required: true,
            onlyAvailableItems: false,
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
          key: 'hvilketRomGjelderDet',
          tags: [],
          properties: {},
          conditional: { show: null, when: null, eq: '', json: '' },
          customConditional: '',
          addons: [],
          type: 'radiopanel',
          input: true,
          hideLabel: false,
          dataGridLabel: true,
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
          labelPosition: 'top',
          tooltip: '',
          tabindex: '',
          disabled: false,
          autofocus: false,
          dbIndex: false,
          calculateServer: false,
          widget: null,
          attributes: {},
          overlay: { style: '', left: '', top: '', width: '', height: '' },
          allowCalculateOverride: false,
          encrypted: false,
          showCharCount: false,
          showWordCount: false,
          allowMultipleMasks: false,
          inputType: 'radio',
          fieldSet: false,
          id: 'eanjmfj',
          defaultValue: '',
        },
        {
          label: 'Container Bad',
          labelPosition: 'top',
          labelWidth: '',
          labelMargin: '',
          tooltip: '',
          customClass: '',
          hideLabel: true,
          persistent: true,
          protected: false,
          dbIndex: false,
          encrypted: false,
          redrawOn: '',
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          calculateServer: false,
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
          unique: false,
          validateOn: 'change',
          errorLabel: '',
          errors: '',
          key: 'containerBad',
          tags: [],
          properties: {},
          conditional: { show: true, when: 'hvilketRomGjelderDet', eq: 'bad', json: '' },
          customConditional: '',
          logic: [],
          attributes: {},
          overlay: { style: '', page: '', left: '', top: '', width: '', height: '' },
          addons: [],
          type: 'container',
          input: true,
          placeholder: '',
          prefix: '',
          suffix: '',
          multiple: false,
          defaultValue: null,
          hidden: false,
          refreshOn: '',
          tableView: false,
          modalEdit: false,
          dataGridLabel: false,
          description: '',
          tabindex: '',
          disabled: false,
          autofocus: false,
          widget: null,
          allowCalculateOverride: false,
          showCharCount: false,
          showWordCount: false,
          allowMultipleMasks: false,
          tree: true,
          lazyLoad: false,
          components: [
            {
              labelWidth: '',
              labelMargin: '',
              content: 'Må signeres av både eier og bruker (bad)',
              alerttype: 'info',
              isInline: false,
              contentForPdf: 'Må signeres av både eier og bruker (bad)',
              key: 'alertstripeBad',
              conditional: { show: true, when: 'eierEllerLeierDuBoligenDuBorI', eq: 'eier', json: '' },
              customConditional: '',
              addons: [],
              type: 'alertstripe',
              label: 'Alertstripe',
              input: true,
              tableView: false,
              placeholder: '',
              prefix: '',
              customClass: '',
              suffix: '',
              multiple: false,
              defaultValue: null,
              protected: false,
              unique: false,
              persistent: false,
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
              validateOn: 'change',
              validate: {
                required: false,
                custom: '',
                customPrivate: false,
                strictDateValidation: false,
                multiple: false,
                unique: false,
              },
              overlay: { style: '', left: '', top: '', width: '', height: '' },
              allowCalculateOverride: false,
              encrypted: false,
              showCharCount: false,
              showWordCount: false,
              properties: {},
              allowMultipleMasks: false,
              tag: 'p',
              attrs: [],
              id: 'el0luqp',
            },
          ],
          id: 'ecp9jrv',
        },
        {
          label: 'Container Stue',
          labelPosition: 'top',
          labelWidth: '',
          labelMargin: '',
          tooltip: '',
          customClass: '',
          hideLabel: true,
          persistent: true,
          protected: false,
          dbIndex: false,
          encrypted: false,
          redrawOn: '',
          clearOnHide: true,
          customDefaultValue: '',
          calculateValue: '',
          calculateServer: false,
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
          unique: false,
          validateOn: 'change',
          errorLabel: '',
          errors: '',
          key: 'containerStue',
          tags: [],
          properties: {},
          conditional: { show: true, when: 'hvilketRomGjelderDet', eq: 'stue', json: '' },
          customConditional: '',
          logic: [],
          attributes: {},
          overlay: { style: '', page: '', left: '', top: '', width: '', height: '' },
          addons: [],
          type: 'container',
          input: true,
          placeholder: '',
          prefix: '',
          suffix: '',
          multiple: false,
          defaultValue: null,
          hidden: false,
          refreshOn: '',
          tableView: false,
          modalEdit: false,
          dataGridLabel: false,
          description: '',
          tabindex: '',
          disabled: false,
          autofocus: false,
          widget: null,
          allowCalculateOverride: false,
          showCharCount: false,
          showWordCount: false,
          allowMultipleMasks: false,
          tree: true,
          lazyLoad: false,
          components: [
            {
              labelWidth: '',
              labelMargin: '',
              content: 'Må signeres av både eier og bruker (stue)',
              alerttype: 'info',
              isInline: false,
              contentForPdf: 'Må signeres av både eier og bruker (stue)',
              key: 'alertstripeStue',
              conditional: { show: true, when: 'eierEllerLeierDuBoligenDuBorI', eq: 'eier', json: '' },
              customConditional: '',
              addons: [],
              type: 'alertstripe',
              label: 'Alertstripe',
              input: true,
              tableView: false,
              placeholder: '',
              prefix: '',
              customClass: '',
              suffix: '',
              multiple: false,
              defaultValue: null,
              protected: false,
              unique: false,
              persistent: false,
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
              validateOn: 'change',
              validate: {
                required: false,
                custom: '',
                customPrivate: false,
                strictDateValidation: false,
                multiple: false,
                unique: false,
              },
              overlay: { style: '', left: '', top: '', width: '', height: '' },
              allowCalculateOverride: false,
              encrypted: false,
              showCharCount: false,
              showWordCount: false,
              properties: {},
              allowMultipleMasks: false,
              tag: 'p',
              attrs: [],
              id: 'ejndp74',
            },
          ],
          id: 'eqvaf8b',
        },
      ],
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
      id: 'e331mrq',
    },
    {
      title: 'Vedlegg',
      type: 'panel',
      input: false,
      key: 'vedleggpanel',
      theme: 'default',
      components: [
        {
          label: 'Annen dokumentasjon',
          description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
          type: 'radiopanel',
          key: 'annenDokumentasjon',
          otherDocumentation: true,
          input: true,
          clearOnHide: true,
          validate: {
            required: true,
            custom: '',
            customPrivate: false,
            strictDateValidation: false,
            multiple: false,
            unique: false,
            onlyAvailableItems: false,
          },
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
          refreshOn: '',
          redrawOn: '',
          tableView: false,
          modalEdit: false,
          dataGridLabel: false,
          labelPosition: 'top',
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
          validateOn: 'change',
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
          id: 'e4xa51a',
        },
      ],
      placeholder: '',
      prefix: '',
      customClass: '',
      suffix: '',
      multiple: false,
      defaultValue: null,
      protected: false,
      unique: false,
      persistent: false,
      hidden: false,
      clearOnHide: false,
      refreshOn: '',
      redrawOn: '',
      tableView: false,
      modalEdit: false,
      label: 'Panel',
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
      validateOn: 'change',
      validate: {
        required: false,
        custom: '',
        customPrivate: false,
        strictDateValidation: false,
        multiple: false,
        unique: false,
      },
      conditional: { show: null, when: null, eq: '' },
      overlay: { style: '', left: '', top: '', width: '', height: '' },
      allowCalculateOverride: false,
      encrypted: false,
      showCharCount: false,
      showWordCount: false,
      properties: {},
      allowMultipleMasks: false,
      addons: [],
      tree: false,
      lazyLoad: false,
      breadcrumb: 'default',
      id: 'ezyosoj',
    },
  ],
  properties: {
    skjemanummer: 'TEST-AK-002',
    tema: 'BIL',
    submissionTypes: ['PAPER', 'DIGITAL'],
    signatures: [{ label: '', description: '', key: 'addf238d-814c-48dd-9167-fb8f06aee95d' }],
    modified: '2022-09-05T07:58:12.346Z',
    modifiedBy: 'ann.katrin.gagnat@nav.no',
    unpublished: '2022-08-03T09:01:42.589Z',
    unpublishedBy: 'ann.katrin.gagnat@nav.no',
    publishedLanguages: [],
  },
  _id: '62babfd5a96657b3cc04cfcf',
  created: '2022-06-28T08:46:13.210Z',
  modified: '2022-09-05T07:58:13.663Z',
};

const formAndSubmission = {
  submissionKjokken,
  submissionBad,
  submissionStue,
  form,
};

export default formAndSubmission;
