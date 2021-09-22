import FormioDay from "formiojs/components/day/Day";
import FormioDayEditForm from "formiojs/components/day/Day.form";

class Day extends FormioDay {
  static editForm(...extend) {
    const dayEditForm = FormioDayEditForm([
      {
        label: "Day",
        key: "day",
        ignore: true,
      },
      ...extend,
    ]);

    const tabComponents = dayEditForm.components.find((i) => i.key === "tabs").components;
    const yearComponents = tabComponents.find((item) => item.key === "year").components;
    return {
      ...dayEditForm,
      components: [
        ...dayEditForm.components.filter((i) => i.key !== "tabs"),
        {
          key: "tabs",
          type: "tabs",
          components: [
            ...tabComponents.map((tab) => {
              if (tab.key === "year")
                return {
                  key: "year",
                  label: "Year",
                  components: [
                    ...yearComponents.map((component) => {
                      if (component.key === "fields.year.minYear" || component.key === "fields.year.maxYear") {
                        return {
                          ...component,
                          placeholder: "",
                        };
                      } else {
                        return component;
                      }
                    }),
                  ],
                };
              else return tab;
            }),
          ],
        },
      ],
    };
  }

  //Override default minYear and maxYear value
  inputDefinition(name) {
    let min, max;
    if (name === "day") {
      min = 1;
      max = 31;
    }
    if (name === "month") {
      min = 1;
      max = 12;
    }
    if (name === "year") {
      min = _.get(this.component, "fields.year.minYear", 1990) || 1990;
      max = _.get(this.component, "fields.year.maxYear", 2050) || 2050;
    }
    return {
      type: "input",
      ref: name,
      attr: {
        id: `${this.component.key}-${name}`,
        class: `form-control ${this.transform("class", `formio-day-component-${name}`)}`,
        type: this.component.fields[name].type === "select" ? "select" : "number",
        placeholder: this.t(this.component.fields[name].placeholder),
        step: 1,
        min,
        max,
      },
    };
  }

  get months() {
    if (this._months) {
      return this._months;
    }
    this._months = [
      {
        value: "",
        label: _.get(this.component, "fields.month.placeholder") || (this.hideInputLabels ? this.t("month") : ""),
      },
      { value: 1, label: this.t("january") },
      { value: 2, label: this.t("february") },
      { value: 3, label: this.t("march") },
      { value: 4, label: this.t("april") },
      { value: 5, label: this.t("may") },
      { value: 6, label: this.t("june") },
      { value: 7, label: this.t("july") },
      { value: 8, label: this.t("august") },
      { value: 9, label: this.t("september") },
      { value: 10, label: this.t("october") },
      { value: 11, label: this.t("november") },
      { value: 12, label: this.t("december") },
    ];
    return this._months;
  }
}

export default Day;
