import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Utils } from 'formiojs';
import { useEffect, useState } from 'react';
import ReactSelect, { components, OnChangeValue } from 'react-select';
import Select from 'react-select/base';
import http from '../../../../api/util/http/http';
import BaseComponent from '../../base/BaseComponent';
import selectBuilder from './Select.builder';
import selectForm from './Select.form';
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
      ref={inputRef}
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
          case 'select-option': {
            const newValue = event.value;
            const selectedOption = options.find((o) => o.value === newValue);
            setSelectedOption(selectedOption);
            onChange(selectedOption);
            break;
          }
          case 'clear':
            setSelectedOption('');
            onChange('');
        }
      }}
    />
  );
};

type SelectInitOptions = { skipOnlyAvailableItems?: boolean };

/**
 * TODO: Rename this to Select and dont use wrapper when we change to Aksel component.
 */
class NavSelect extends BaseComponent {
  isLoading = false;
  loadFinished = false;
  selectOptions: any = [];
  ignoreOptions: string[] = [];
  itemsLoaded: Promise<any> | undefined = undefined;
  itemsLoadedResolve: undefined | ((value?: any) => void) = undefined;

  static schema() {
    return BaseComponent.schema({
      label: 'Nedtrekksmeny',
      type: 'navSelect',
      key: 'navSelect',
      dataSrc: 'values',
      validate: {
        required: true,
        onlyAvailableItems: true,
      },
    });
  }

  static editForm() {
    return selectForm(NavSelect.schema().type);
  }

  static get builderInfo() {
    return selectBuilder();
  }

  translateOptionLabels(options) {
    return options.map((option) => ({ ...option, label: this.translate(option.label) }));
  }

  translateOptionLabel(option) {
    return option && option.label ? { ...option, label: this.translate(option.label) } : option;
  }

  translateAriaLiveMessages(messages) {
    return messages(this.translate.bind(this));
  }

  setValueOnReactInstance(value) {
    if (this.reactInstance && value) {
      (this.reactInstance as Select)?.selectOption(value);
    }
  }

  loadItems() {
    const component = this.component!;
    if (component.dataSrc === 'values') {
      this.selectOptions = component.data?.values ?? [];
    } else if (component.dataSrc === 'url' && !this.isLoading && !this.loadFinished) {
      this.itemsLoadedResolve?.();
      this.itemsLoaded = new Promise((resolve) => {
        this.itemsLoadedResolve = resolve;
      });
      const dataUrl = component.data?.url;
      if (dataUrl) {
        this.isLoading = true;
        http
          .get<any[]>(dataUrl)
          .then((data) => {
            const { valueProperty, labelProperty } = component;

            this.selectOptions = data
              .map((obj) => {
                if (!(this.ignoreOptions ?? []).includes(obj[labelProperty || 'value'])) {
                  return {
                    label: obj[labelProperty || 'label'],
                    value: obj[valueProperty || 'value'],
                  };
                }
              })
              .filter(Boolean);
          })
          .catch((err) => {
            this.emit('componentError', {
              component,
              message: err.toString(),
            });
            console.warn(`Unable to load resources for ${this.key} (dataUrl=${dataUrl})`);
          })
          .finally(() => {
            this.isLoading = false;
            this.loadFinished = true;
            this.itemsLoadedResolve?.();
            this.rerender();
          });
      }
    }
  }

  init(options: SelectInitOptions = {}) {
    super.init();
    const { skipOnlyAvailableItems = false } = options;
    this.validators = this.validators.concat(skipOnlyAvailableItems ? [] : ['onlyAvailableItems']);
    this.loadItems();
  }

  get dataReady(): Promise<any> {
    return this.itemsLoaded || Promise.resolve();
  }

  get ready() {
    return this.dataReady.then(() => this);
  }

  /**
   * Denne funksjonen kalles fra formio sin valideringskode når validator 'onlyAvailableItems' er aktivert.
   *
   * @param setting Komponent-egenskap 'validate.onlyAvailableItems'
   * @param value Verdi som skal valideres
   */
  validateValueAvailability(setting, value) {
    if (!Utils.boolValue(setting) || !value) {
      return true;
    }
    const options = this.selectOptions;
    if (options) {
      return !!options.find((option) => option.value === value.value);
    }
    return false;
  }

  renderReact(element) {
    const component = this.component!;
    return element.render(
      <>
        <ReactSelectWrapper
          component={component}
          options={this.translateOptionLabels(this.selectOptions)}
          label={this.translate(component.label)}
          value={this.translateOptionLabel(this.getValue())}
          ariaLiveMessages={this.translateAriaLiveMessages(ariaLiveMessages)}
          screenReaderStatus={({ count }: { count: number }) =>
            this.translate(SELECT_TEXTS.numberOfAvailableOptions, { count })
          }
          loadingMessage={() => this.translate(TEXTS.statiske.loading)}
          onChange={(value) => this.handleChange(value)}
          inputRef={(ref) => this.setReactInstance(ref)}
          isLoading={this.isLoading}
        />
        {this.getError() && (
          <div className="aksel-form-field__error" aria-live="polite">
            <p className="aksel-error-message aksel-label">{this.getError()}</p>
          </div>
        )}
      </>,
    );
  }
}

export default NavSelect;
