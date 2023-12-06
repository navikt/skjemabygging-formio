import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import selectEditForm from 'formiojs/components/select/Select.form';
import { useEffect, useRef, useState } from 'react';
import ReactSelect, { OnChangeValue, components } from 'react-select';
import Select from 'react-select/base';
import http from '../../../api/util/http/http';
import FormBuilderOptions from '../../form-builder-options';
import FormioReactComponent from '../FormioReactComponent';
import BaseComponent from '../base/BaseComponent';
import { fieldSizeField } from '../fields/fieldSize';
import { ariaLiveMessages } from './utils/ariaLiveMessages';

const { navSelect: SELECT_TEXTS } = TEXTS.grensesnitt;

const reactSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: 'var(--a-font-size-large)',
    minHeight: 'var(--input-min-height)',
    border: '1px solid #78706a',
    boxShadow: state.isFocused ? '0 0 0 3px #254b6d' : undefined,
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: '3',
  }),
};

const Input = (props) => {
  const ariaProps = {
    'aria-describedby': props.selectProps['aria-describedby'],
  };

  return <components.Input {...props} {...ariaProps} />;
};

const ReactSelectWrapper = ({
  component,
  options,
  label,
  value,
  onChange,
  inputRef,
  isLoading,
  ariaLiveMessages,
  screenReaderStatus,
  loadingMessage,
}) => {
  const [selectedOption, setSelectedOption] = useState(value);
  useEffect(() => {
    setSelectedOption(value);
  }, [value, options]);
  const ref = useRef<Select>(null);
  useEffect(() => {
    if (ref.current) inputRef(ref.current);
  }, [ref.current]);

  return (
    <ReactSelect
      id={`selectContainer-${component.id}-${component.key}`}
      instanceId={`${component.id}-${component.key}`}
      aria-labelledby={`l-${component.id}-${component.key}`}
      aria-describedby={component.description ? `d-${component.id}-${component.key}` : ''}
      aria-label={label}
      options={options}
      value={selectedOption}
      defaultValue={component.defaultValue}
      inputId={`${component.id}-${component.key}`}
      required={component.validate.required}
      placeholder={component.placeholder}
      isLoading={isLoading}
      ref={ref}
      className={component.fieldSize || 'input--xxl'}
      styles={reactSelectStyles}
      isClearable={true}
      backspaceRemovesValue={true}
      components={{ Input }}
      ariaLiveMessages={ariaLiveMessages}
      screenReaderStatus={screenReaderStatus}
      loadingMessage={loadingMessage}
      onChange={(event: OnChangeValue<any, any>, actionType) => {
        switch (actionType.action) {
          case 'select-option':
            const newValue = event.value;
            const selectedOption = options.find((o) => o.value === newValue);
            setSelectedOption(selectedOption);
            onChange(selectedOption);
            break;
          case 'clear':
            setSelectedOption('');
            onChange('');
        }
      }}
    />
  );
};

class NavSelect extends BaseComponent {
  isLoading = false;
  loadFinished = false;
  selectOptions: any = [];

  static schema(...extend) {
    // @ts-ignore
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.basic.components.navSelect.schema,
      ...extend,
    });
  }

  get defaultSchema() {
    return NavSelect.schema();
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
          key: 'display',
          components: [
            { key: 'widget', ignore: true },
            { key: 'labelPosition', ignore: true },
            { key: 'placeholder', ignore: true },
            { key: 'tooltip', ignore: true },
            { key: 'customClass', ignore: true },
            { key: 'tabindex', ignore: true },
            { key: 'hidden', ignore: true },
            { key: 'hideLabel', ignore: true },
            { key: 'uniqueOptions', ignore: true },
            { key: 'autofocus', ignore: true },
            { key: 'disabled', ignore: true },
            { key: 'tableView', ignore: true },
            { key: 'modalEdit', ignore: true },
            fieldSizeField,
          ],
        },
        {
          key: 'data',
          components: [
            { key: 'multiple', ignore: true },
            { key: 'dataType', ignore: true },
            { key: 'idPath', ignore: true },
            { key: 'template', ignore: true },
            { key: 'indexeddb.database', ignore: true },
            { key: 'indexeddb.table', ignore: true },
            { key: 'indexeddb.filter', ignore: true },
            { key: 'refreshOn', ignore: true },
            { key: 'refreshOnBlur', ignore: true },
            { key: 'clearOnRefresh', ignore: true },
            { key: 'searchEnabled', ignore: true },
            { key: 'selectThreshold', ignore: true },
            { key: 'readOnlyValue', ignore: true },
            { key: 'customOptions', ignore: true },
            { key: 'useExactSearch', ignore: true },
            { key: 'persistent', ignore: true },
            { key: 'protected', ignore: true },
            { key: 'dbIndex', ignore: true },
            { key: 'encrypted', ignore: true },
            { key: 'redrawOn', ignore: true },
            { key: 'calculateServer', ignore: true },
            { key: 'allowCalculateOverride', ignore: true },
            { key: 'searchField', ignore: true },
            { key: 'searchDebounce', ignore: true },
            { key: 'minSearch', ignore: true },
            { key: 'filter', ignore: true },
            { key: 'sort', ignore: true },
            { key: 'limit', ignore: true },
            { key: 'authenticate', ignore: true },
            { key: 'ignoreCache', ignore: true },
          ],
        },
        {
          key: 'validation',
          components: [
            { key: 'validateOn', ignore: true },
            { key: 'errorLabel', ignore: true },
            { key: 'validate.customMessage', ignore: true },
            { key: 'unique', ignore: true },
          ],
        },
        {
          key: 'api',
          components: [
            { key: 'tags', ignore: true },
            { key: 'properties', ignore: true },
          ],
        },
        { key: 'logic', ignore: true },
        { key: 'layout', ignore: true },
      ],
      ...extend,
    );
  }

  translateOptionLabels(options) {
    return options.map((option) => ({ ...option, label: this.t(option.label) }));
  }

  translateOptionLabel(option) {
    return option && option.label ? { ...option, label: this.t(option.label) } : option;
  }

  translateAriaLiveMessages(messages) {
    return messages(this.t.bind(this));
  }

  setValueOnReactInstance(value) {
    if (this.reactInstance && value) {
      (this.reactInstance as Select)?.selectOption(value);
    }
  }

  renderReact(element) {
    const component = this.component!;
    if (component.dataSrc === 'values') {
      this.selectOptions = component.data.values;
    } else if (component.dataSrc === 'url' && !this.isLoading && !this.loadFinished) {
      const dataUrl = component.data.url;
      this.isLoading = true;
      http
        .get<any[]>(dataUrl)
        .then((data) => {
          const { valueProperty, labelProperty } = component;
          this.selectOptions = data.map((obj) => ({
            label: obj[labelProperty || 'label'],
            value: obj[valueProperty || 'value'],
          }));
        })
        .catch((err) => {
          this.emit('componentError', {
            component,
            message: err.toString(),
          });
          // @ts-ignore
          console.warn(`Unable to load resources for ${this.key} (dataUrl=${dataUrl})`);
        })
        .finally(() => {
          this.isLoading = false;
          this.loadFinished = true;
          this.rerender();
        });
    }

    return element.render(
      <ReactSelectWrapper
        component={component}
        options={this.translateOptionLabels(this.selectOptions)}
        label={this.t(component.label)}
        value={this.translateOptionLabel(this.getDefaultValue())}
        ariaLiveMessages={this.translateAriaLiveMessages(ariaLiveMessages)}
        screenReaderStatus={({ count }: { count: number }) => this.t(SELECT_TEXTS.numberOfAvailableOptions, { count })}
        loadingMessage={() => this.t(TEXTS.statiske.loading)}
        onChange={(value) => this.updateValue(value, {})}
        inputRef={(ref) => this.setReactInstance(ref)}
        isLoading={this.isLoading}
      />,
    );
  }
}

export default NavSelect;
