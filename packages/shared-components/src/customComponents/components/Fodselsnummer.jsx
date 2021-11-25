import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import TextFieldComponent from "formiojs/components/textfield/TextField";
import baseEditForm from "formiojs/components/_classes/component/Component.form";
import FormBuilderOptions from "../../Forms/form-builder-options";

const k1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
const k2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const decimalRadix = 10;

export const computeK1 = (fnrFoerste9Siffer) => {
  const tempK1 = fnrFoerste9Siffer
    .split("")
    .map((value, index) => parseInt(value, decimalRadix) * k1[index])
    .reduce((acc, val) => (acc += +val), 0);
  const K1 = tempK1 % 11 === 0 ? 0 : 11 - (tempK1 % 11);
  return K1;
};

const erGyldigK1 = (fodselsnummer) => {
  const K1 = computeK1(fodselsnummer.substring(0, 9));
  return K1 === parseInt(fodselsnummer.substring(9, 10), decimalRadix);
};

export const computeK2 = (fnrFoerste10Siffer) => {
  const tempK2 = fnrFoerste10Siffer
    .split("")
    .map((value, index) => parseInt(value, decimalRadix) * k2[index])
    .reduce((acc, val) => (acc += +val), 0);
  const K2 = tempK2 % 11 === 0 ? 0 : 11 - (tempK2 % 11);
  return K2;
};

const erGyldigK2 = (fodselsnummer) => {
  const K2 = computeK2(fodselsnummer.substring(0, 10));
  return K2 === parseInt(fodselsnummer.substring(10), decimalRadix);
};

export const erGyldigeKontrollsifre = (fodselsnummer) => erGyldigK1(fodselsnummer) && erGyldigK2(fodselsnummer);

export const erGyldigFodselsnummer = (fodselsnummer) =>
  fodselsnummer.length !== 11 ? false : erGyldigeKontrollsifre(fodselsnummer);

export default class Fodselsnummer extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema({
      ...FormBuilderOptions.builder.person.components.fnrfield.schema,
      ...extend,
    });
  }

  //Beholdes for å sikre bakoverkompatibilitet for eldre skjemaer
  validateFnr(fnrTekstWithMiddleSpace) {
    if (fnrTekstWithMiddleSpace === "") {
      // Vi lar default required-validering ta hånd om tomt felt feilmelding
      return "true";
    }

    const fnrTekst = fnrTekstWithMiddleSpace.replace(" ", "");
    return erGyldigFodselsnummer(fnrTekst);
  }

  validateFnrNew(fnrTekstWithMiddleSpace) {
    if (fnrTekstWithMiddleSpace === "") {
      // Vi lar default required-validering ta hånd om tomt felt feilmelding
      return true;
    }

    const fnrTekst = fnrTekstWithMiddleSpace.replace(" ", "");

    if (!erGyldigeKontrollsifre(fnrTekst)) {
      //translate based on key in validering file.
      return this.t("fodselsnummerDNummer") === "fodselsnummerDNummer"
        ? TEXTS.validering.fodselsnummerDNummer
        : this.t("fodselsnummerDNummer");
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
          key: "display",
          components: [
            {
              // You can ignore existing fields.
              key: "placeholder",
              ignore: true,
            },
            {
              key: "tabindex",
              ignore: true,
            },
            {
              key: "tooltip",
              ignore: true,
            },
            {
              key: "customClass",
              ignore: true,
            },
            {
              key: "hidden",
              ignore: true,
            },
            {
              key: "hideLabel",
              ignore: true,
            },
            {
              key: "autofocus",
              ignore: true,
            },
            {
              key: "disabled",
              ignore: true,
            },
            {
              key: "tableView",
              ignore: true,
            },
            {
              key: "modalEdit",
              ignore: true,
            },
          ],
        },
        {
          key: "data",
          ignore: true,
          components: false,
        },
        {
          key: "validation",
          ignore: true,
          components: false,
        },
        {
          key: "logic",
          ignore: true,
          components: false,
        },
        {
          key: "layout",
          ignore: true,
          components: false,
        },
      ],
      ...extend
    );
  }
}
