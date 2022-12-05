import { Component } from "@navikt/skjemadigitalisering-shared-domain";
import selectEditForm from "formiojs/components/select/Select.form";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactSelect from "react-select";
import http from "../../api/http";
import FormBuilderOptions from "../../Forms/form-builder-options";
import FormioReactComponent from "../FormioReactComponent";

const ReactSelectWrapper = ({ component, options, value, onChange, inputRef, isLoading }) => {
  const [internalValue, setInternalValue] = useState(options.find((o) => o.value === value));
  useEffect(() => {
    setInternalValue(options.find((option) => option.value === value));
  }, [value, options]);
  return (
    <ReactSelect
      id={`selectContainer-${component.id}-${component.key}`}
      options={options}
      value={internalValue}
      defaultValue={component.defaultValue}
      inputId={`${component.id}-${component.key}`}
      required={component.validate.required}
      placeholder={component.placeholder}
      isLoading={isLoading}
      ref={inputRef}
      onChange={(event, actionType) => {
        const newValue = event.value;
        setInternalValue(options.find((o) => o.value === newValue));
        onChange(newValue);
      }}
    />
  );
};

class NavSelect extends FormioReactComponent {
  reactElement = null;
  dataForSetting = null;
  shouldSetValue = false;
  input: HTMLInputElement | null = null;
  isLoading = false;
  loaded = false;
  selectOptions: any[] = [];
  _itemsLoaded: any | Promise<any> = null;

  static schema(...extend) {
    // @ts-ignore
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.basic.components.select.schema,
      ...extend,
    });
  }

  static get builderInfo() {
    return {
      ...FormBuilderOptions.builder.basic.components.select,
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

  translateOptions(options) {
    // @ts-ignore
    return options.map((option) => ({ ...option, label: this.t(option.label) }));
  }

  renderReact(element) {
    // @ts-ignore
    const component: Component = this.component as Component;
    // let options = [];
    if (component.dataSrc === "values") {
      this.selectOptions = component.data.values;
      this.itemsLoaded = Promise.resolve();
    } else if (component.dataSrc === "url") {
      if (!this.isLoading && !this.loaded) {
        this.isLoading = true;
        this.itemsLoaded = http
          .get<any[]>(component.data.url)
          .then((data) => {
            this.isLoading = false;
            this.loaded = true;
            this.selectOptions = data;
            // super.redraw();
          })
          .catch((err) => {
            console.log(`Error while loading select options: url=${component.data.url}`);
            this.isLoading = false;
          });
      }
    }
    return ReactDOM.render(
      <ReactSelectWrapper
        component={component}
        options={this.translateOptions(this.selectOptions)}
        value={this.dataForSetting || this.dataValue}
        onChange={(value) => this.setValue(value, {})}
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

  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  get itemsLoaded() {
    return this._itemsLoaded || Promise.resolve();
  }

  set itemsLoaded(promise) {
    this._itemsLoaded = promise;
  }

  get dataReady(): any | Promise<any> {
    // @ts-ignore
    if (this.component.dataSrc === "url") {
      return this._itemsLoaded;
    }
    return Promise.resolve();
  }
}

export default NavSelect;
