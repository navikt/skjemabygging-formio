import fnrvalidator from '@navikt/fnrvalidator';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import baseEditForm from 'formiojs/components/_classes/component/Component.form';
import TextFieldComponent from 'formiojs/components/textfield/TextField';
import FormBuilderOptions from '../../form-builder-options';

const ALLOWED_TYPES = ['fnr', 'dnr'];

export default class Fodselsnummer extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema({
      ...FormBuilderOptions.builder.person.components.fnrfield.schema,
      ...extend,
    });
  }

  validateFnrNew(inputValue) {
    if (inputValue === '') {
      // Vi lar default required-validering ta hånd om tomt felt feilmelding
      return true;
    }

    const inputValueNoSpace = inputValue.replace(' ', '');

    const { status, type } = fnrvalidator.idnr(inputValueNoSpace);
    if (!ALLOWED_TYPES.includes(type) || status !== 'valid') {
      //translate based on key in validering file.
      return this.t('fodselsnummerDNummer') === 'fodselsnummerDNummer'
        ? TEXTS.validering.fodselsnummerDNummer
        : this.t('fodselsnummerDNummer');
    }
    return true;
  }

  get defaultSchema() {
    return Fodselsnummer.schema();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.person.components.fnrfield;
  }

  static editForm(...extend) {
    return baseEditForm(
      [
        {
          key: 'display',
          components: [
            {
              // You can ignore existing fields.
              key: 'placeholder',
              ignore: true,
            },
            {
              key: 'tabindex',
              ignore: true,
            },
            {
              key: 'tooltip',
              ignore: true,
            },
            {
              key: 'customClass',
              ignore: true,
            },
            {
              key: 'hidden',
              ignore: true,
            },
            {
              key: 'hideLabel',
              ignore: true,
            },
            {
              key: 'autofocus',
              ignore: true,
            },
            {
              key: 'disabled',
              ignore: true,
            },
            {
              key: 'tableView',
              ignore: true,
            },
            {
              key: 'modalEdit',
              ignore: true,
            },
          ],
        },
        {
          key: 'data',
          ignore: true,
          components: false,
        },
        {
          key: 'validation',
          ignore: true,
          components: false,
        },
        {
          key: 'api',
          components: [
            { key: 'tags', ignore: true },
            { key: 'properties', ignore: true },
          ],
        },
        {
          key: 'logic',
          ignore: true,
          components: false,
        },
        {
          key: 'layout',
          ignore: true,
          components: false,
        },
        {
          key: 'addons',
          ignore: true,
          components: false,
        },
      ],
      ...extend,
    );
  }
}
