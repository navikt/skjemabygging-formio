import { Component } from "@navikt/skjemadigitalisering-shared-domain";
import selectEditForm from "formiojs/components/select/Select.form";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactSelect from "react-select";
import http from "../../api/http";
import FormBuilderOptions from "../../Forms/form-builder-options";
import FormioReactComponent from "../FormioReactComponent";
import { fieldSizeField } from "./fields/fieldSize";

const reactSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    border: "1px solid #78706a",
    boxShadow: state.isFocused ? "0 0 0 3px #254b6d" : undefined,
  }),
};

const ReactSelectWrapper = ({ component, options, value, onChange, inputRef, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState(value);
  useEffect(() => {
    setSelectedOption(value);
  }, [value, options]);
  return (
    <ReactSelect
      id={`selectContainer-${component.id}-${component.key}`}
      options={options}
      value={selectedOption}
      defaultValue={component.defaultValue}
      inputId={`${component.id}-${component.key}`}
      required={component.validate.required}
      placeholder={component.placeholder}
      isLoading={isLoading}
      ref={inputRef}
      className={component.fieldSize}
      styles={reactSelectStyles}
      isClearable={true}
      backspaceRemovesValue={true}
      onChange={(event, actionType) => {
        switch (actionType.action) {
          case "select-option":
            const newValue = event.value;
            const selectedOption = options.find((o) => o.value === newValue);
            setSelectedOption(selectedOption);
            onChange(selectedOption);
            break;
          case "clear":
            setSelectedOption("");
            onChange("");
        }
      }}
    />
  );
};

class NavSelect extends FormioReactComponent {
  reactElement = null;
  dataForSetting = null;
  shouldSetValue = false;
  isLoading = false;
  loadFinished = false;
  selectOptions: any[] = [];

  static schema(...extend) {
    // @ts-ignore
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.basic.components.navSelect.schema,
      ...extend,
    });
  }

  static get builderInfo() {
    return {
      ...FormBuilderOptions.builder.basic.components.navSelect,
      schema: NavSelect.schema(),
    };
  }

  static editForm(...extend) {
    return selectEditForm(
      [
        {
          key: "display",
          components: [{ key: "widget", ignore: true }, fieldSizeField],
        },
        {
          key: "data",
          components: [
            { key: "multiple", ignore: true },
            { key: "dataType", ignore: true },
            { key: "idPath", ignore: true },
            { key: "template", ignore: true },
            { key: "indexeddb.database", ignore: true },
            { key: "indexeddb.table", ignore: true },
            { key: "indexeddb.filter", ignore: true },
            { key: "refreshOn", ignore: true },
            { key: "refreshOnBlur", ignore: true },
            { key: "clearOnRefresh", ignore: true },
            { key: "searchEnabled", ignore: true },
            { key: "selectThreshold", ignore: true },
            { key: "readOnlyValue", ignore: true },
            { key: "customOptions", ignore: true },
            { key: "useExactSearch", ignore: true },
            { key: "persistent", ignore: true },
            { key: "protected", ignore: true },
            { key: "dbIndex", ignore: true },
            { key: "encrypted", ignore: true },
            { key: "redrawOn", ignore: true },
            { key: "calculateServer", ignore: true },
            { key: "allowCalculateOverride", ignore: true },
            { key: "searchField", ignore: true },
            { key: "searchDebounce", ignore: true },
            { key: "minSearch", ignore: true },
            { key: "filter", ignore: true },
            { key: "sort", ignore: true },
            { key: "limit", ignore: true },
            { key: "authenticate", ignore: true },
            { key: "ignoreCache", ignore: true },
          ],
        },
      ],
      ...extend
    );
  }

  translateOptionLabels(options) {
    return options.map((option) => ({ ...option, label: this.t(option.label) }));
  }

  translateOptionLabel(option) {
    return option && option.label ? { ...option, label: this.t(option.label) } : option;
  }

  renderReact(element) {
    const component: Component = this.component as Component;
    if (component.dataSrc === "values") {
      this.selectOptions = component.data.values;
    } else if (component.dataSrc === "url") {
      if (!this.isLoading && !this.loadFinished) {
        const dataUrl = component.data.url;
        this.isLoading = true;
        http
          .get<any[]>(dataUrl)
          .then((data) => {
            const { valueProperty, labelProperty } = component;
            this.selectOptions = data.map((obj) => ({
              label: obj[labelProperty || "label"],
              value: obj[valueProperty || "value"],
            }));
          })
          .catch((err) => {
            this.emit("componentError", {
              component,
              message: err.toString(),
            });
            // @ts-ignore
            console.warn(`Unable to load resources for ${this.key} (dataUrl=${dataUrl})`);
          })
          .finally(() => {
            this.isLoading = false;
            this.loadFinished = true;
            super.redraw();
          });
      }
    }
    return ReactDOM.render(
      <ReactSelectWrapper
        component={component}
        options={this.translateOptionLabels(this.selectOptions)}
        value={this.translateOptionLabel(this.dataForSetting || this.dataValue)}
        onChange={(value) => this.updateValue(value, {})}
        inputRef={(ref) => (this.input = ref)}
        isLoading={this.isLoading}
      />,
      element
    );
  }

  attachReact(element) {
    this.reactElement = element;
    this.renderReact(element);
    return this.reactElement;
  }

  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }

  getValue() {
    return this.dataValue;
  }

  setValue(value, flag) {
    this.dataForSetting = value;
    if (this.reactElement) {
      this.renderReact(this.reactElement);
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
    }
    return super.setValue(value, flag);
  }
}

export default NavSelect;
