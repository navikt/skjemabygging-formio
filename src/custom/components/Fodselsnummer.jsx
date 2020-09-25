import components from 'formiojs/components';
import baseEditForm from "formiojs/components/_classes/component/Component.form";

const TextFieldComponent = components.textfield;

const k1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
const k2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const decimalRadix = 10;

export const computeK1 = (fnrFoerste9Siffer) => {
  const tempK1 = fnrFoerste9Siffer.split("")
    .map((value, index) => parseInt(value, decimalRadix) * k1[index])
    .reduce((acc, val) => (acc += +val), 0);
  const K1 = tempK1 % 11 === 0 ? 0 : 11 - (tempK1 % 11);
  return K1;
}

const erGyldigK1 = (fodselsnummer) => {
  const K1 = computeK1(fodselsnummer.substring(0, 9));
  return K1 === parseInt(fodselsnummer.substring(9, 10), decimalRadix);
};

export const computeK2 = (fnrFoerste10Siffer) => {
  const tempK2 = fnrFoerste10Siffer.split("")
    .map((value, index) => parseInt(value, decimalRadix) * k2[index])
    .reduce((acc, val) => (acc += +val), 0);
  const K2 = tempK2 % 11 === 0 ? 0 : 11 - (tempK2 % 11);
  return K2;
}

const erGyldigK2 = (fodselsnummer) => {
  const K2 = computeK2(fodselsnummer.substring(0, 10));
  return K2 === parseInt(fodselsnummer.substring(10), decimalRadix);
};

export const erGyldigeKontrollsifre = (fodselsnummer) =>
  erGyldigK1(fodselsnummer) && erGyldigK2(fodselsnummer);

export const erGyldigFodselsnummer = (fodselsnummer) =>
  fodselsnummer.length !== 11 ? false : erGyldigeKontrollsifre(fodselsnummer);


export default class Fodselsnummer extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema({
      type: 'fodselsnummer',
      "label": "Fødselsnummer / D-nummer",
      spellcheck: false,
      validateOn: "blur",
      "validate": {
        "custom": "valid = instance.validateFnr(input) ? true : 'Dette er ikke et gyldig fødselsnummer eller D-nummer';",
        "required": true,
      },
      "input": true
    }, ...extend);
  }

  validateFnr(fnrTekstWithMiddleSpace) {
    if (fnrTekstWithMiddleSpace === '') { // Vi lar default required-validering ta hånd om tomt felt feilmelding
      return true;
    }
    const fnrTekst = fnrTekstWithMiddleSpace.replace(' ', '');
    return erGyldigFodselsnummer(fnrTekst);
  }

  get defaultSchema() {
    return Fodselsnummer.schema();
  }

  static get builderInfo() {
    return {
      title: 'Fødselsnummer',
      group: 'advanced',
      icon: 'fa fa-terminal',
      // weight: 70,
      // documentation: 'http://help.form.io/userguide/#table',
      schema: Fodselsnummer.schema()
    }
  }

  static editForm(...extend) {
    return baseEditForm(
      [
        {
          key: "display",
          components: [
            {
              // You can ignore existing fields.
              key: "placeholder",
              ignore: true
            },
            {
              // Or add your own. The syntax is form.io component definitions.
              type: "textfield",
              input: true,
              label: "My Custom Setting",
              weight: 12,
              key: "myCustomSetting" // This will be available as component.myCustomSetting
            }
          ]
        },
        {
          key: "data",
          ignore: true,
          components: false
        },
        {
          key: "validation",
          ignore: true,
          components: false
        },
        {
          key: "api",
          components: []
        },
        {
          key: "conditional",
          components: []
        },
        {
          key: "logic",
          components: []
        }
      ],
      ...extend
    );
  }
}
