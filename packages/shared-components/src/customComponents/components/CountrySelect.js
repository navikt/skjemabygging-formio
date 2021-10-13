import Select from "formiojs/components/select/Select";
import selectEditForm from "formiojs/components/select/Select.form";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

class CountrySelect extends Select {
  static get builderInfo() {
    return {
      title: "Landvelger",
      key: "landvelger",
      group: "person",
      icon: "th-list",
      schema: FormBuilderOptions.builder.person.components.landvelger.schema,
    };
  }

  static schema(...extend) {
    return Select.schema({
      ...FormBuilderOptions.builder.person.components.landvelger.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return selectEditForm([
      {
        key: "data",
        components: [
          { key: "dataSrc", ignore: true },
          { key: "indexeddb.database", ignore: true },
          { key: "indexeddb.table", ignore: true },
          { key: "indexeddb.filter", ignore: true },
          { key: "data.json", ignore: true },
          { key: "data.url", ignore: true },
          { key: "data.headers", ignore: true },
          { key: "data.values", ignore: true },
          { key: "valueProperty", ignore: true },
          { key: "limit", ignore: true },
        ],
      },
      ...extend,
    ]);
  }
}

export default CountrySelect;