import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import moment from "moment";
import React from "react";
import { setupNavFormio } from "../../../test/navform-render";
import NavForm from "../../components/NavForm";
import NavDatePicker from "./NavDatepicker";

Date.now = jest.fn(() => new Date("2030-05-15T12:00:00.000Z").getTime());

describe("NavDatePicker", () => {
  let datePicker;

  const mockedShowNorwegianOrTranslation = (text, params) => {
    if (params)
      return TEXTS.validering[text]
        .replace(/{{2}([^{}]*minDate)}{2}/, params.minDate)
        .replace(/{{2}([^{}]*maxDate)}{2}/, params.maxDate)
        .replace(/{{2}([^{}]*fromDate)}{2}/, params.fromDate);
    else return TEXTS.validering[text];
  };

  beforeEach(() => {
    datePicker = new NavDatePicker();
    jest
      .spyOn(NavDatePicker.prototype, "showNorwegianOrTranslation")
      .mockImplementation((text, params) => mockedShowNorwegianOrTranslation(text, params));
  });

  describe("Valideringsfunksjonene", () => {
    const createComponent = (beforeDateInputKey, mayBeEqual, earliestAllowedDate, latestAllowedDate) => ({
      beforeDateInputKey,
      mayBeEqual,
      earliestAllowedDate,
      latestAllowedDate,
    });

    it("returns true when input is undefined", () => {
      expect(datePicker.validateDatePicker(undefined)).toBe(true);
      expect(datePicker.validateDatePickerV2(undefined)).toBe(true);
    });

    it("returns error message for to and from date, when both validations fail", () => {
      const comp = createComponent("fromDate", false, "10", undefined);
      const expectedValidationErrorMessage = "Datoen må være senere enn 21.05.2030";
      expect(
        datePicker.validateDatePicker(
          "2030-05-20",
          { fromDate: "2030-05-21" },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate
        )
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-21" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    it("returns error message for earliest/latest date when only earliest/latest validation fails", () => {
      const comp = createComponent("fromDate", false, "10");
      const expectedValidationErrorMessage = "Datoen kan ikke være tidligere enn 25.05.2030";
      expect(
        datePicker.validateDatePicker(
          "2030-05-20",
          { fromDate: "2030-05-19" },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate
        )
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-19" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    it("returns error message when both earliest/latest is set to number 0", () => {
      const comp = createComponent("fromDate", false, 0, 0);
      const expectedValidationErrorMessage =
        "Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030";
      expect(
        datePicker.validateDatePicker(
          "2030-05-20",
          { fromDate: "2030-05-19" },
          comp.beforeDateInputKey,
          comp.mayBeEqual,
          comp.earliestAllowedDate,
          comp.latestAllowedDate
        )
      ).toBe(expectedValidationErrorMessage);
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-19" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    describe("Validation inside data grid", () => {
      it("fails validation for date inside data grid", () => {
        const input = "2021-10-01";
        const submissionData = { datagrid: [{ fraDato: "2021-10-02", tilDato: "2021-10-01" }] };
        const expectedValidationErrorMessage = "Datoen kan ikke være tidligere enn 02.10.2021";
        const comp = createComponent("datagrid.fraDato", true, undefined, undefined);
        const row = { fraDato: "2021-10-02", tilDato: "2021-10-01" };
        expect(
          datePicker.validateDatePicker(
            input,
            submissionData,
            comp.beforeDateInputKey,
            comp.mayBeEqual,
            comp.earliestAllowedDate,
            comp.latestAllowedDate,
            row
          )
        ).toBe(expectedValidationErrorMessage);
        expect(datePicker.validateDatePickerV2(input, submissionData, comp, row)).toBe(expectedValidationErrorMessage);
      });

      it("validation ok when date is later than fromDate inside data grid", () => {
        const input = "2021-10-03";
        const submissionData = { datagrid: [{ fraDato: "2021-10-02", tilDato: "2021-10-03" }] };
        const comp = createComponent("datagrid.fraDato", true, undefined, undefined);
        const row = { fraDato: "2021-10-02", tilDato: "2021-10-03" };
        expect(
          datePicker.validateDatePicker(
            input,
            submissionData,
            comp.beforeDateInputKey,
            comp.mayBeEqual,
            comp.earliestAllowedDate,
            comp.latestAllowedDate,
            row
          )
        ).toBe(true);
        expect(datePicker.validateDatePickerV2(input, submissionData, comp, row)).toBe(true);
      });
    });

    describe("validateToAndFromDate", () => {
      let fromDate;
      let earlierThanFromDate;
      let sameAsFromDate;
      let laterThanFromDate;

      beforeEach(() => {
        fromDate = moment("2030-12-31");
        earlierThanFromDate = moment("2020-01-01");
        sameAsFromDate = moment("2030-12-31");
        laterThanFromDate = moment("2040-12-31");
      });

      describe("When mayBeEqual is true", () => {
        it("Fails with appropriate message when inputDate is earlier than from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, earlierThanFromDate, true)).toBe(
            "Datoen kan ikke være tidligere enn 31.12.2030"
          );
        });

        it("Returns true when inputDate is same as from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, sameAsFromDate, true)).toBe(true);
        });

        it("Returns true when inputDate is later than from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, laterThanFromDate, true)).toBe(true);
        });
      });

      describe("When mayBeEqual is false", () => {
        it("fails with appropriate message when input is earlier than from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, earlierThanFromDate, false)).toBe(
            "Datoen må være senere enn 31.12.2030"
          );
        });

        it("fails with appropriate message when input is same as from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, earlierThanFromDate, false)).toBe(
            "Datoen må være senere enn 31.12.2030"
          );
        });

        it("Returns true when inputDate is later than from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, laterThanFromDate, false)).toBe(true);
        });
      });
    });

    describe("validateEarliestAndLatestDate", () => {
      describe("When earliestFromToday and latestFromToday are set", () => {
        it("doesn't fail if latest is before earliest", () => {
          expect(datePicker.validateEarliestAndLatestDate("2", "1", moment())).toBe(true);
        });

        it("fails with appropriate message if input is before earliest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("1", "2", moment())).toBe(
            "Datoen kan ikke være tidligere enn 16.05.2030 eller senere enn 17.05.2030"
          );
        });

        it("fails with appropriate message if input is after latest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("-2", "-1", moment())).toBe(
            "Datoen kan ikke være tidligere enn 13.05.2030 eller senere enn 14.05.2030"
          );
        });

        it("returns true if input is same as earliest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("0", "1", moment())).toBe(true);
        });

        it("returns true if input is between earliest and latest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("-1", "1", moment())).toBe(true);
        });

        it("returns true if input is same as latest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("-1", "0", moment())).toBe(true);
        });
      });

      describe("When earliestFromToday is set", () => {
        it("fails with appropriate message if input is before earliest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("1", "", moment())).toBe(
            "Datoen kan ikke være tidligere enn 16.05.2030"
          );
        });

        it("returns true if input is same as earliest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("0", "", moment())).toBe(true);
        });

        it("returns true if input is after earliest", () => {
          expect(datePicker.validateEarliestAndLatestDate("-1", "", moment())).toBe(true);
        });
      });

      describe("When latestFromToday is set", () => {
        it("fails with appropriate message if input is after latest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("", "-1", moment())).toBe(
            "Datoen kan ikke være senere enn 14.05.2030"
          );
        });

        it("returns true if input is same as latest date", () => {
          expect(datePicker.validateEarliestAndLatestDate("", "0", moment())).toBe(true);
        });

        it("returns true if input is before latest", () => {
          expect(datePicker.validateEarliestAndLatestDate("", "1", moment())).toBe(true);
        });
      });

      describe("both earliestFromToday and latestFromToday is set to number 0", () => {
        it("fails if selected date is tomorrow", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, 0, moment().add(1, "d"))).toBe(
            "Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030"
          );
        });

        it("validates ok if selected date is today", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, 0, moment())).toBe(true);
        });

        it("validates ok if selected date is yesterday", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, 0, moment().subtract(1, "d"))).toBe(
            "Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030"
          );
        });
      });

      describe("latestFromToday is set to number 0", () => {
        it("fails if selected date is tomorrow", () => {
          expect(datePicker.validateEarliestAndLatestDate(undefined, 0, moment().add(1, "d"))).toBe(
            "Datoen kan ikke være senere enn 15.05.2030"
          );
        });

        it("validates ok if selected date is today", () => {
          expect(datePicker.validateEarliestAndLatestDate(undefined, 0, moment())).toBe(true);
        });

        it("validates ok if selected date is yesterday", () => {
          expect(datePicker.validateEarliestAndLatestDate(undefined, 0, moment().subtract(1, "d"))).toBe(true);
        });
      });

      describe("earliestFromToday is set to number 0", () => {
        it("fails if selected date is yesterday", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, undefined, moment().subtract(1, "d"))).toBe(
            "Datoen kan ikke være tidligere enn 15.05.2030"
          );
        });

        it("validates ok if selected date is today", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, undefined, moment())).toBe(true);
        });

        it("validates ok if selected date is tomorrow", () => {
          expect(datePicker.validateEarliestAndLatestDate(0, undefined, moment().add(1, "d"))).toBe(true);
        });
      });

      it("returns true if neither earliestFromToday or latestFromToday are set", () => {
        expect(datePicker.validateEarliestAndLatestDate("", "", moment())).toBe(true);
      });

      it("returns true if both earliestFromToday or latestFromToday are undefined", () => {
        expect(datePicker.validateEarliestAndLatestDate(undefined, undefined, moment())).toBe(true);
      });
    });
  });

  describe("Datovalidering", () => {
    const defaultDatePickerComponent = {
      id: "oppgiDato",
      key: "oppgiDatoKey",
      type: "navDatepicker",
      label: "Oppgi dato",
      dataGridLabel: true,
      validateOn: "blur",
    };

    describe("Validation of relative latestAllowedDate/earliestAllowedDate", () => {
      describe("Datepicker med latestAllowedDate 14 dager tilbake i tid", () => {
        const component = {
          ...defaultDatePickerComponent,
          latestAllowedDate: "-14",
        };

        describe("Validering feiler når valgt dato er 13 dager tilbake i tid", () => {
          const submissionData = { oppgiDatoKey: "2030-05-02" };
          const row = submissionData;

          it("validateDatePicker", () => {
            const validationResultV1 = datePicker.validateDatePicker(
              "2030-05-02",
              submissionData,
              component.beforeDateInputKey,
              component.mayBeEqual,
              component.earliestAllowedDate,
              component.latestAllowedDate,
              row
            );
            expect(validationResultV1).toEqual("Datoen kan ikke være senere enn 01.05.2030");
          });

          it("validateDatePickerV2", () => {
            const validationResultV2 = datePicker.validateDatePickerV2("2030-05-02", submissionData, component, row);
            expect(validationResultV2).toEqual("Datoen kan ikke være senere enn 01.05.2030");
          });
        });

        describe("Validering ok når valgt dato er 14 dager tilbake i tid", () => {
          const submissionData = { oppgiDatoKey: "2030-05-01" };
          const row = submissionData;

          it("validateDatePicker", () => {
            const validationResultV1 = datePicker.validateDatePicker(
              "2030-05-01",
              submissionData,
              component.beforeDateInputKey,
              component.mayBeEqual,
              component.earliestAllowedDate,
              component.latestAllowedDate,
              row
            );
            expect(validationResultV1).toBe(true);
          });

          it("validateDatePickerV2", () => {
            const validationResultV2 = datePicker.validateDatePickerV2("2030-05-01", submissionData, component, row);
            expect(validationResultV2).toBe(true);
          });
        });
      });
    });

    describe("Validation of a specific earliest and/or latest date", () => {
      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-03'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: "2030-05-03",
        };

        it("Validering feiler når valgt dato er tidligere enn specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-02" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-02", submissionData, component, row);
          expect(validationResultV2).toEqual("Datoen kan ikke være tidligere enn 03.05.2030");
        });

        it("Validering ok når valgt dato er samme som specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-03" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-03", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });

      describe("Datepicker med specificLatestAllowedDate lik '2030-05-02'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificLatestAllowedDate: "2030-05-02",
        };

        it("Validering feiler når valgt dato er senere enn specificLatestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-03" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-03", submissionData, component, row);
          expect(validationResultV2).toEqual("Datoen kan ikke være senere enn 02.05.2030");
        });

        it("Validering ok når valgt dato er samme som specificLatestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-02" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-02", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });

      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-02', og specificLatestAllowedDate lik '2030-05-03'", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: "2030-05-02",
          specificLatestAllowedDate: "2030-05-03",
        };

        it("Validering feiler når valgt dato er senere enn specificLatestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-04" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-04", submissionData, component, row);
          expect(validationResultV2).toEqual(
            "Datoen kan ikke være tidligere enn 02.05.2030 eller senere enn 03.05.2030"
          );
        });

        it("Validering feiler når valgt dato er tidligere enn specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-01" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-01", submissionData, component, row);
          expect(validationResultV2).toEqual(
            "Datoen kan ikke være tidligere enn 02.05.2030 eller senere enn 03.05.2030"
          );
        });

        it("Validering ok når valgt dato er samme som specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-02" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-02", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });

        it("Validering ok når valgt dato er samme som specificLatestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-03" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-03", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });
    });

    describe("Validation of a combination of relative and specific dates", () => {
      describe("Datepicker med specificEarliestAllowedDate lik '2030-05-02', og latestAllowedDate lik 0", () => {
        const component = {
          ...defaultDatePickerComponent,
          specificEarliestAllowedDate: "2030-05-02",
          latestAllowedDate: 0,
        };

        it("Validering feiler når valgt dato er dagen før specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-01" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-01", submissionData, component, row);
          expect(validationResultV2).toEqual("Datoen kan ikke være tidligere enn 02.05.2030");
        });

        it("Validering ok når valgt dato er samme dag som specificEarliestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-02" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-02", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });

        it("Validering feiler når valgt dato er dagen etter latestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-16" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-16", submissionData, component, row);
          expect(validationResultV2).toEqual("Datoen kan ikke være senere enn 15.05.2030");
        });

        it("Validering ok når valgt dato er samme dag som latestAllowedDate", () => {
          const submissionData = { oppgiDatoKey: "2030-05-15" };
          const row = submissionData;
          const validationResultV2 = datePicker.validateDatePickerV2("2030-05-15", submissionData, component, row);
          expect(validationResultV2).toBe(true);
        });
      });
    });
  });

  describe("when rendered with Form.io", () => {
    beforeAll(setupNavFormio);

    const testForm = {
      title: "Testskjema",
      type: "form",
      display: "wizard",
      components: [
        {
          title: "Panel",
          type: "panel",
          components: [
            {
              visArvelger: true,
              label: "Dato (dd.mm.åååå)",
              mayBeEqual: false,
              validate: {
                required: true,
                custom: "valid = instance.validateDatePickerV2(input, data, component, row);",
              },
              validateOn: "blur",
              key: "datoDdMmAaaa",
              type: "navDatepicker",
              dataGridLabel: true,
              input: true,
              tableView: false,
            },
          ],
        },
        {
          title: "Panel",
          type: "panel",
          components: [
            {
              label: "Fornavn",
              type: "textfield",
              key: "textfield",
              inputType: "text",
              input: true,
              validate: {
                required: true,
              },
            },
          ],
        },
      ],
    };

    const renderNavForm = async (props) => {
      const formReady = jest.fn();
      const renderReturn = render(<NavForm {...props} formReady={formReady} />);
      await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
      return renderReturn;
    };

    it("sets value to empty string when clearing value", async () => {
      await renderNavForm({
        form: testForm,
      });
      const form = await screen.findByRole("form");
      expect(form).toBeInTheDocument();
      const datepickerInput = screen.getByLabelText("Dato (dd.mm.åååå)");
      expect(datepickerInput).toBeInTheDocument();

      datepickerInput.focus();
      userEvent.type(datepickerInput, "01.01.2020");
      expect(datepickerInput.value).toBe("01.01.2020");

      userEvent.type(datepickerInput, "{selectall}{backspace}");
      expect(datepickerInput.value).toBe("");

      const nextButton = screen.getByRole("button", { name: "Neste" });
      expect(nextButton).toBeInTheDocument();
      nextButton.click();

      const errorMessage = await screen.findByText("Du må fylle ut: Dato (dd.mm.åååå)");
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
