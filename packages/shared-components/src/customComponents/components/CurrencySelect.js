import FormBuilderOptions from "../../Forms/form-builder-options";
import NavSelect from "./NavSelect";

class CurrencySelect extends NavSelect {
  static get builderInfo() {
    return {
      title: "Valutavelger",
      key: "valutavelger",
      group: "pengerOgKonto",
      icon: "th-list",
      schema: CurrencySelect.schema(),
    };
  }

  static schema(...extend) {
    return NavSelect.schema({
      ...FormBuilderOptions.builder.pengerOgKonto.components.valutavelger.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return NavSelect.editForm([
      {
        key: "data",
        components: [
          { key: "dataSrc", ignore: true },
          { key: "data.url", ignore: true },
          { key: "data.headers", ignore: true },
          { key: "selectValues", ignore: true },
          { key: "dataType", ignore: true },
          { key: "valueProperty", ignore: true },
          { key: "disableLimit", ignore: true },
        ],
      },
      ...extend,
    ]);
  }
}

export default CurrencySelect;
