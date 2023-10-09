const submissionVegghengtOmitted = {
  data: { radiopanel: 'nei', annenDokumentasjon: 'nei' },
};

const submissionVegghengtNei = {
  data: {
    radiopanel: 'ja',
    annenDokumentasjon: 'nei',
    container: { vegghengt: 'nei' },
  },
};

const submissionVegghengtJa = {
  data: {
    radiopanel: 'ja',
    annenDokumentasjon: 'nei',
    container: { vegghengt: 'ja' },
  },
};

const form = {
  _id: {
    $oid: '123456789',
  },
  title: 'Testing alert bug',
  name: 'testAk002',
  path: 'testak002',
  type: 'form',
  display: 'wizard',
  tags: ['nav-skjema', ''],
  deleted: null,
  owner: {
    $oid: '987654321',
  },
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
      key: 'steg1',
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
      tableView: false,
      components: [
        {
          label: 'Radiopanel',
          labelWidth: '',
          labelMargin: '',
          description: '',
          descriptionPosition: '',
          additionalDescription: false,
          values: [
            {
              value: 'ja',
              label: 'Ja',
              shortcut: '',
            },
            {
              value: 'nei',
              label: 'Nei',
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
          key: 'radiopanel',
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
          inputType: 'radio',
          fieldSet: false,
          id: 'eje2ss',
          defaultValue: null,
        },
        {
          label: 'Container',
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
          key: 'container',
          tags: [],
          properties: {},
          conditional: {
            show: true,
            when: 'radiopanel',
            eq: 'ja',
            json: '',
          },
          customConditional: '',
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
          type: 'container',
          input: true,
          tableView: false,
          components: [
            {
              label: 'Vegghengt?',
              additionalDescription: false,
              values: [
                {
                  value: 'ja',
                  label: 'Ja',
                  shortcut: '',
                },
                {
                  value: 'nei',
                  label: 'Nei',
                  shortcut: '',
                },
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
              key: 'vegghengt',
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
              defaultValue: null,
              protected: false,
              unique: false,
              persistent: true,
              hidden: false,
              clearOnHide: true,
              refreshOn: '',
              redrawOn: '',
              modalEdit: false,
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
              conditional: {
                show: null,
                when: null,
                eq: '',
              },
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
              properties: {},
              allowMultipleMasks: false,
              addons: [],
              inputType: 'radio',
              fieldSet: false,
              id: 'eo53ga5',
            },
          ],
          placeholder: '',
          prefix: '',
          suffix: '',
          multiple: false,
          defaultValue: null,
          hidden: false,
          refreshOn: '',
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
          id: 'ezz25nh',
        },
        {
          labelWidth: '',
          labelMargin: '',
          content: 'Må signeres av både eier og bruker',
          alerttype: 'info',
          isInline: false,
          contentForPdf: 'Må signeres av både eier og bruker',
          key: 'alertstripe',
          conditional: {
            show: null,
            when: null,
            eq: '',
            json: '',
          },
          customConditional: 'show = data.container.vegghengt === "ja"',
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
          properties: {},
          allowMultipleMasks: false,
          tag: 'p',
          attrs: [],
          id: 'eq8z13k',
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
          properties: {
            vedleggstittel: 'Annet',
            vedleggskode: 'N6',
          },
          values: [
            {
              value: 'nei',
              label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.',
            },
            {
              value: 'leggerVedNaa',
              label: 'Ja, jeg legger det ved denne søknaden.',
            },
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
          conditional: {
            show: null,
            when: null,
            eq: '',
          },
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
      conditional: {
        show: null,
        when: null,
        eq: '',
      },
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
    innsending: 'PAPIR_OG_DIGITAL',
    signatures: [
      {
        label: '',
        description: '',
        key: 'addf238d-814c-48dd-9167-fb8f06aee95d',
      },
    ],
    modified: '2022-09-02T10:11:40.389Z',
    modifiedBy: 'ann.katrin.gagnat@nav.no',
    unpublished: '2022-08-03T09:01:42.589Z',
    unpublishedBy: 'ann.katrin.gagnat@nav.no',
    publishedLanguages: [],
  },
  project: {
    $oid: '55555555555555555',
  },
  created: {
    $date: {
      $numberLong: '1656405973210',
    },
  },
  modified: {
    $date: {
      $numberLong: '1662113501120',
    },
  },
  machineName: 'jvcemxwcpghcqjn:testAk002',
  __v: {
    $numberInt: '26',
  },
};

const formAndSubmission = {
  submissionVegghengtOmitted,
  submissionVegghengtNei,
  submissionVegghengtJa,
  form,
};

export default formAndSubmission;
