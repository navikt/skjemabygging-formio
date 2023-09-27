import { DatePicker, DatePickerProps, useDatepicker } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import apiEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import { getContextComponents } from "formiojs/utils/utils";
import moment from "moment";
import React, { useEffect } from "react";
import FormBuilderOptions from "../../Forms/form-builder-options";
import FormioReactComponent from "../FormioReactComponent";
import { UseDatepickerOptions } from "@navikt/ds-react/esm/date/hooks/useDatepicker";

const SUBMISSION_DATE_FORMAT = "YYYY-MM-DD";

const DatovelgerWrapper = ({ component, onChange, value, locale, readOnly, inputRef }) => {
  // @ts-ignore
  const { datepickerProps, inputProps, setSelected, reset }: DatePickerProps = useDatepicker({
    required: component.validate.required,
    onDateChange: (val) => {
      onChange(val ? moment(val).format(SUBMISSION_DATE_FORMAT) : "");
    },
  } as UseDatepickerOptions);

  useEffect(() => {
    if (value) {
      setSelected(moment(value, SUBMISSION_DATE_FORMAT).toDate());
    } else {
      reset();
    }
  }, [value]);

  return (
    <DatePicker
      id={component.id}
      selected={value ? moment(value, SUBMISSION_DATE_FORMAT).toDate() : undefined}
      locale={locale}
      {...datepickerProps}
    >
      <DatePicker.Input
        id={`${component.id}-${component.key}`}
        readOnly={readOnly}
        {...inputProps}
        ref={inputRef}
        hideLabel
      />
    </DatePicker>
  );
};

function isCorrectOrder(beforeDate, afterDate, mayBeEqual = false) {
  return mayBeEqual ? beforeDate.isSameOrBefore(afterDate, "d") : beforeDate.isBefore(afterDate, "d");
}

export default class NavDatepicker extends FormioReactComponent {
  isValid = this.errors.length === 0;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    const { title, key, icon } = FormBuilderOptions.builder.datoOgTid.components.datoVelger;
    return {
      title,
      icon,
      key,
      documentation: "",
      weight: 0,
      schema: NavDatepicker.schema(),
    };
  }

  showNorwegianOrTranslation(key, params?) {
    if (params) {
      return this.t(key) === key ? this.t(TEXTS.validering[key], params) : this.t(key, params);
    }
    return this.t(key) === key ? TEXTS.validering[key] : this.t(key);
  }

  validateToAndFromDate(beforeDate, inputDate, mayBeEqual) {
    if (isCorrectOrder(beforeDate, inputDate, mayBeEqual)) {
      return true;
    }
    const beforeDateAsString = beforeDate.format("DD.MM.YYYY");
    return mayBeEqual
      ? this.showNorwegianOrTranslation("dateNotBeforeFromDate", { fromDate: beforeDateAsString })
      : this.showNorwegianOrTranslation("dateAfterFromDate", { fromDate: beforeDateAsString });
  }

  validateEarliestAndLatestDate(earliestFromToday = "", latestFromToday = "", inputDate) {
    const earliestAllowedDate = !!String(earliestFromToday) ? moment().add(String(earliestFromToday), "d") : undefined;
    const latestAllowedDate = !!String(latestFromToday) ? moment().add(String(latestFromToday), "d") : undefined;
    return this.validateEarliestAndLatest(earliestAllowedDate, latestAllowedDate, inputDate);
  }

  validateEarliestAndLatest(earliestAllowedDate, latestAllowedDate, inputDate) {
    const earliestAllowedDateAsString = earliestAllowedDate ? earliestAllowedDate.format("DD.MM.YYYY") : "";
    const latestAllowedDateAsString = latestAllowedDate ? latestAllowedDate.format("DD.MM.YYYY") : "";
    if (earliestAllowedDate && latestAllowedDate) {
      if (!isCorrectOrder(earliestAllowedDate, latestAllowedDate, true)) {
        return true;
      }
      return inputDate.isBefore(earliestAllowedDate, "d") || inputDate.isAfter(latestAllowedDate, "d")
        ? `${this.showNorwegianOrTranslation("dateInBetween", {
            minDate: earliestAllowedDateAsString,
            maxDate: latestAllowedDateAsString,
          })}`
        : true;
    }

    if (earliestAllowedDate && inputDate.isBefore(earliestAllowedDate, "d")) {
      return `${this.showNorwegianOrTranslation("dateNotBeforeAllowedDate")} ${earliestAllowedDateAsString}`;
    }

    if (latestAllowedDate && inputDate.isAfter(latestAllowedDate, "d")) {
      return `${this.showNorwegianOrTranslation("dateNotLaterThanAllowedDate")} ${latestAllowedDateAsString}`;
    }

    return true;
  }

  validateDatePicker(
    input,
    submissionData,
    beforeDateInputKey,
    mayBeEqual,
    relativeEarliestAllowedDate = "",
    relativeLatestAllowedDate = "",
    row,
  ) {
    if (!input) {
      return true;
    }

    let toAndFromDateValidation = true;
    if (beforeDateInputKey) {
      const beforeDateValue =
        submissionData[beforeDateInputKey] ||
        (beforeDateInputKey.includes(".") && row && row[beforeDateInputKey.replace(/.*\./i, "")]);
      if (beforeDateValue) {
        toAndFromDateValidation = this.validateToAndFromDate(moment(beforeDateValue), moment(input), mayBeEqual);
      }
    }

    const earliestFromToday = String(relativeEarliestAllowedDate);
    const latestFromToday = String(relativeLatestAllowedDate);

    const earliestAndLatestDateValidation =
      !!earliestFromToday || !!latestFromToday
        ? this.validateEarliestAndLatestDate(earliestFromToday, latestFromToday, moment(input))
        : true;

    if (typeof toAndFromDateValidation === "string") {
      return toAndFromDateValidation;
    }
    if (typeof earliestAndLatestDateValidation === "string") {
      return earliestAndLatestDateValidation;
    }
    return true;
  }

  validateDatePickerV2(input, submissionData, component, row) {
    if (!input) {
      return true;
    }

    const result = this.validateDatePicker(
      input,
      submissionData,
      component.beforeDateInputKey,
      component.mayBeEqual,
      component.earliestAllowedDate,
      component.latestAllowedDate,
      row,
    );
    if (result === true) {
      const { specificEarliestAllowedDate, specificLatestAllowedDate } = component;

      const earliest = specificEarliestAllowedDate ? moment(specificEarliestAllowedDate) : undefined;
      const latest = specificLatestAllowedDate ? moment(specificLatestAllowedDate) : undefined;
      return this.validateEarliestAndLatest(earliest, latest, moment(input));
    }
    return result;
  }

  static schema() {
    return FormioReactComponent.schema(FormBuilderOptions.builder.datoOgTid.components.datoVelger.schema);
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm() {
    const excludeFromDisplay = [
      "placeholder",
      "hidden",
      "disabled",
      "tooltip",
      "customClass",
      "labelPosition",
      "tabindex",
      "hideLabel",
      "autofocus",
      "tableView",
      "modalEdit",
      "unique",
    ];

    return {
      type: "hidden",
      key: "type",
      components: [
        {
          type: "tabs",
          key: "tabs",
          components: [
            {
              label: "Visning",
              key: "display",
              weight: 0,
              components: [
                {
                  type: "checkbox",
                  label: "Vis årvelger i kalender",
                  key: "visArvelger",
                  defaultValue: true,
                  input: true,
                },
                ...displayEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
              ],
            },
            {
              label: "Validering",
              key: "validation",
              weight: 20,
              components: [
                {
                  type: "panel",
                  title: "Fra-til-dato",
                  components: [
                    {
                      type: "select",
                      input: true,
                      label: "Datofelt for fra-dato",
                      key: "beforeDateInputKey",
                      dataSrc: "custom",
                      valueProperty: "value",
                      data: {
                        custom(context) {
                          return getContextComponents(context);
                        },
                      },
                    },
                    {
                      type: "checkbox",
                      label: "Kan være lik",
                      key: "mayBeEqual",
                      defaultValue: false,
                      input: true,
                    },
                  ],
                },
                {
                  type: "panel",
                  title: "Begrens periode relativt til dagens dato",
                  components: [
                    {
                      type: "number",
                      label: "Tidligst tillatt dato (antall dager fram/bak i tid)",
                      key: "earliestAllowedDate",
                      input: true,
                    },
                    {
                      type: "number",
                      label: "Senest tillatt dato (antall dager fram/bak i tid)",
                      key: "latestAllowedDate",
                      input: true,
                    },
                    {
                      type: "alertstripe",
                      key: "begrensTillattDatoInfo",
                      content:
                        "<div><p>Oppgi antall dager for å sette tidligste og seneste tillatte dato. Begrensningen er relativ til datoen skjemaet fylles ut. Bruk positive tall for å oppgi dager fram i tid, negative tall for å sette tillatt dato bakover i tid, og 0 for å sette dagens dato som tidligst/senest tillatt.</p><p>Eksempel: hvis tidligst tillatt er satt til -5, vil datoer før 10. august 2022 gi feilmelding når skjemaet fylles ut 15. august 2022</p></div>",
                      alerttype: "info",
                    },
                  ],
                },
                {
                  type: "panel",
                  title: "Begrens dato til tidligst/senest en spesifikk dato",
                  components: [
                    {
                      type: "navDatepicker",
                      label: "Tidligst tillatt dato",
                      key: "specificEarliestAllowedDate",
                      input: true,
                    },
                    {
                      type: "navDatepicker",
                      label: "Senest tillatt dato",
                      key: "specificLatestAllowedDate",
                      input: true,
                    },
                  ],
                },
                ...validationEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
              ],
            },
            {
              label: "Conditional",
              key: "conditional",
              weight: 40,
              components: conditionalEditForm,
            },
            {
              label: "API",
              key: "api",
              weight: 60,
              components: apiEditForm,
            },
          ],
        },
      ],
    };
  }

  renderReact(element) {
    return element.render(
      <DatovelgerWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataForSetting || this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        locale={this.root.i18next.language}
        readOnly={this.options.readOnly}
        inputRef={(r) => (this.input = r)}
      />,
    );
  }

  checkValidity(data, dirty, rowData) {
    const isValid = super.checkValidity(data, dirty, rowData);
    this.componentIsValid(isValid);

    if (!isValid) {
      return false;
    }
    return this.validate(data, dirty, rowData);
  }

  componentIsValid = (isValid) => {
    if (isValid !== this.isValid) {
      this.isValid = !this.isValid;
      this.renderReact(this.reactInstance);
    }
  };
}
