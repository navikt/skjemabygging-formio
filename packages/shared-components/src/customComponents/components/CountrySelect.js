import FormBuilderOptions from "../../Forms/form-builder-options";
import NavSelect from "./NavSelect";

class CountrySelect extends NavSelect {
  static get builderInfo() {
    return {
      title: "Landvelger",
      key: "landvelger",
      group: "person",
      icon: "th-list",
      schema: CountrySelect.schema(),
    };
  }

  static schema(...extend) {
    return NavSelect.schema({
      ...FormBuilderOptions.builder.person.components.landvelger.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return NavSelect.editForm([
      {
        key: "data",
        components: [
          { key: "dataSrc", ignore: true },
          { key: "indexeddb.database", ignore: true },
          { key: "indexeddb.table", ignore: true },
          { key: "indexeddb.filter", ignore: true },
          { key: "data.url", ignore: true },
          { key: "data.headers", ignore: true },
          { key: "selectValues", ignore: true },
          { key: "dataType", ignore: true },
          { key: "idPath", ignore: true },
          { key: "valueProperty", ignore: true },
          { key: "disableLimit", ignore: true },
          { key: "searchField", ignore: true },
          { key: "minSearch", ignore: true },
          { key: "filter", ignore: true },
          { key: "sort", ignore: true },
          { key: "limit", ignore: true },
        ],
      },
      ...extend,
    ]);
  }
}

export default CountrySelect;
