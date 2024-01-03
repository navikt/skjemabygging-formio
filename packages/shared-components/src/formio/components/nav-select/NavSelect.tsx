import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import ReactSelect, { OnChangeValue, components } from 'react-select';
import Select from 'react-select/base';
import http from '../../../api/util/http/http';
import BaseComponent from '../base/BaseComponent';
import navSelectForm from './NavSelect.form';
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

  static editForm() {
    return navSelectForm();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Nedtrekksmeny',
      type: 'navSelect',
      key: 'navSelect',
      dataSrc: 'values',
    });
  }

  get defaultSchema() {
    return NavSelect.schema();
  }

  static get builderInfo() {
    return {
      title: 'Nedtrekksmeny',
      key: 'navSelect',
      icon: 'th-list',
      group: 'basic',
      schema: {
        ...NavSelect.schema(),
        ...BaseComponent.defaultBuilderInfoSchema(),
      },
    };
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
      this.selectOptions = component.data?.values ?? [];
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
