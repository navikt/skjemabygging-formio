import { Component } from "@navikt/skjemadigitalisering-shared-domain";
import selectEditForm from "formiojs/components/select/Select.form";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactSelect from "react-select";
import http from "../../api/http";
import FormBuilderOptions from "../../Forms/form-builder-options";
import FormioReactComponent from "../FormioReactComponent";

const ReactSelectWrapper = ({ component, options, value, onChange, inputRef, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState(value);
  useEffect(() => {
    console.log(`wrapper: useEffect=${JSON.stringify(value)}`);
    setSelectedOption(value);
  }, [value, options]);
  console.log(`wrapper: selectedOption=${JSON.stringify(selectedOption)}`);
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
      onChange={(event, actionType) => {
        const newValue = event.value;
        const selectedOption = options.find((o) => o.value === newValue);
        setSelectedOption(selectedOption);
        console.log(`wrapper onChange: newValue=${newValue}, selectedOption=${JSON.stringify(selectedOption)}`);
        onChange(selectedOption);
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
          components: [{ key: "widget", ignore: true }],
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
              label: obj[labelProperty || "navn"], // TODO endre default til "label"
              value: obj[valueProperty || "value"],
            }));

            console.log(`Done loading ${data.length} options: ${dataUrl}`);
          })
          .catch((err) => {
            // TODO feilhåndtering
            console.error(`Error while loading select options: url=${dataUrl}, msg=${err.message}`);
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
