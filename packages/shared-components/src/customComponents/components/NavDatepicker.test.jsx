import {TEXTS} from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavDatePicker from "./NavDatepicker";
import {renderNavForm, setupNavFormio} from "../../../test/navform-render";

Date.now = jest.fn(() => new Date("2030-05-15T12:00:00.000Z").getTime());

describe("NavDatePicker", () => {

  describe("Valideringsfunksjonene", () => {
    let datePicker;
    const mockedShowNorwegianOrTranslation = (text, params) => {
      if (params)
        return TEXTS.validering[text]
          .replace(/{{2}([^{}]*)}{2}/, params.minDate)
          .replace(/{{2}([^{}]*)}{2}/, params.maxDate);
      else return TEXTS.validering[text];
    };

    beforeEach(() => {
      datePicker = new NavDatePicker();
      jest
        .spyOn(NavDatePicker.prototype, "showNorwegianOrTranslation")
        .mockImplementation((text, params) => mockedShowNorwegianOrTranslation(text, params));
    });

    const createComponent = (beforeDateInputKey, mayBeEqual, earliestAllowedDate, latestAllowedDate) => ({
      beforeDateInputKey,
      mayBeEqual,
      earliestAllowedDate,
      latestAllowedDate,
    })

    it("returns true when input is undefined", () => {
      expect(datePicker.validateDatePicker(undefined)).toBe(true);
      expect(datePicker.validateDatePickerV2(undefined)).toBe(true);
    });

    it("returns error message for to and from date, when both validations fail", () => {
      const comp = createComponent("fromDate", false, "10", undefined);
      const expectedValidationErrorMessage = "Datoen må være senere enn fra-dato (21.05.2030)";
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-21" }, comp.beforeDateInputKey, comp.mayBeEqual, comp.earliestAllowedDate)).toBe(
        expectedValidationErrorMessage
      );
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-21" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    it("returns error message for earliest/latest date when only earliest/latest validation fails", () => {
      const comp = createComponent("fromDate", false, "10");
      const expectedValidationErrorMessage = "Datoen kan ikke være tidligere enn 25.05.2030";
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-19" }, comp.beforeDateInputKey, comp.mayBeEqual, comp.earliestAllowedDate)).toBe(
        expectedValidationErrorMessage
      );
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-19" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    it("returns error message when both earliest/latest is set to number 0", () => {
      const comp = createComponent("fromDate", false, 0, 0);
      const expectedValidationErrorMessage = "Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030";
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-19" }, comp.beforeDateInputKey, comp.mayBeEqual, comp.earliestAllowedDate, comp.latestAllowedDate)).toBe(
        expectedValidationErrorMessage
      );
      expect(datePicker.validateDatePickerV2("2030-05-20", { fromDate: "2030-05-19" }, comp)).toBe(
        expectedValidationErrorMessage
      );
    });

    describe("Validation inside data grid", () => {
      it("fails validation for date inside data grid", () => {
        const input = "2021-10-01";
        const submissionData = { datagrid: [{ fraDato: "2021-10-02", tilDato: "2021-10-01" }] };
        const expectedValidationErrorMessage = "Datoen kan ikke være tidligere enn fra-dato (02.10.2021)";
        const comp = createComponent("datagrid.fraDato",true,undefined,undefined);
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
        expect(
          datePicker.validateDatePickerV2(
            input,
            submissionData,
            comp,
            row
          )
        ).toBe(expectedValidationErrorMessage);
      });

      it("validation ok when date is later than fromDate inside data grid", () => {
        const input = "2021-10-03";
        const submissionData = { datagrid: [{ fraDato: "2021-10-02", tilDato: "2021-10-03" }] };
        const comp = createComponent("datagrid.fraDato",true,undefined,undefined);
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
        expect(
          datePicker.validateDatePickerV2(
            input,
            submissionData,
            comp,
            row
          )
        ).toBe(true);
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
            "Datoen kan ikke være tidligere enn fra-dato (31.12.2030)"
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
            "Datoen må være senere enn fra-dato (31.12.2030)"
          );
        });

        it("fails with appropriate message when input is same as from-date", () => {
          expect(datePicker.validateToAndFromDate(fromDate, earlierThanFromDate, false)).toBe(
            "Datoen må være senere enn fra-dato (31.12.2030)"
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

  describe("NavDatepicker in a form", () => {

    beforeAll(setupNavFormio);

    async function apneKalenderOgVelgDato(dato) {
      const kalenderKnapp = await screen.findByTitle("Kalenderikon");
      expect(kalenderKnapp).toBeInTheDocument();
      userEvent.click(kalenderKnapp.closest("button"));
      const andreMai = await screen.findByLabelText(dato);
      userEvent.click(andreMai);
    }

    const defaultPanelProps = label => ({
      type: "panel",
      label,
      title: label,
      key: label.replace(" ", "").toLowerCase(),
      input: false,
    });

    const CUSTOM_VALIDATE_DATE_PICKER_V1 = "valid = instance.validateDatePicker(input, data," +
      "component.beforeDateInputKey, component.mayBeEqual, " +
      "component.earliestAllowedDate, component.latestAllowedDate, row);";
    const CUSTOM_VALIDATE_DATE_PICKER_V2 = "valid = instance.validateDatePickerV2(input, data, component, row);";

    const createForm = (datepickerProps = {}) => ({
      title: "Testskjema",
      display: "wizard",
      components: [
        {
          ...defaultPanelProps("Panel 1"),
          components: [
            {
              id: "oppgiDato",
              key: "oppgiDatoKey",
              type: "navDatepicker",
              label: "Oppgi dato",
              dataGridLabel: true,
              validateOn: "blur",
              ...datepickerProps,
            },
          ],
        },
      ],
    });

    describe("Validation of relative latestAllowedDate/earliestAllowedDate", () => {

      let submission = null;
      let onSubmit;

      beforeEach(() => {
        submission = null;
        onSubmit = (arg) => submission = arg;
      });

      const validationFunctions = [
        {
          nameOfValidationFunction: "validateDatePicker",
          customValidation:
          CUSTOM_VALIDATE_DATE_PICKER_V1,
        },
        {
          nameOfValidationFunction: "validateDatePickerV2",
          customValidation: CUSTOM_VALIDATE_DATE_PICKER_V2,
        },
      ];

      it.each(validationFunctions)
      (
        "[$nameOfValidationFunction considers latestAllowedDate during validation",
        async ({customValidation}) => {
          const form = createForm({
            latestAllowedDate: "-14",
            validate: {
              custom: customValidation,
              required: true,
            }
          });
          await renderNavForm({form, onSubmit});

          await apneKalenderOgVelgDato("02.05.2030, torsdag");
          userEvent.click(await screen.findByRole("button", {name: "Neste"}));

          const errorDiv = await screen.findByText("Datoen kan ikke være senere enn 01.05.2030");
          expect(errorDiv).toBeInTheDocument();
          expect(errorDiv).toHaveClass("error");

          expect(submission).toBeNull();

          await apneKalenderOgVelgDato("01.05.2030, onsdag");
          userEvent.click(await screen.findByRole("button", {name: "Neste"}));

          await waitFor(() => expect(submission).not.toBeNull());
          expect(submission.data.oppgiDatoKey).toEqual("2030-05-01");
        }
      , 10000);

    });

    describe("Validation of a specific earliest and/or latest date", () => {

      let submission = null;
      let onSubmit;

      beforeEach(() => {
        submission = null;
        onSubmit = (arg) => submission = arg;
      });

      it("considers specificEarliestAllowedDate during validation",async () => {
        const form = createForm({
          specificEarliestAllowedDate: "2030-05-03",
          validate: {
            custom: CUSTOM_VALIDATE_DATE_PICKER_V2,
            required: true,
          }
        });
        await renderNavForm({form, onSubmit});

        await apneKalenderOgVelgDato("02.05.2030, torsdag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        const errorDiv = await screen.findByText("Datoen kan ikke være tidligere enn 03.05.2030");
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveClass("error");

        expect(submission).toBeNull();

        await apneKalenderOgVelgDato("03.05.2030, fredag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        await waitFor(() => expect(submission).not.toBeNull());
        expect(submission.data.oppgiDatoKey).toEqual("2030-05-03");
      }, 10000);

      it("considers specificLatestAllowedDate during validation",async () => {
        const form = createForm({
          specificLatestAllowedDate: "2030-05-02",
          validate: {
            custom: CUSTOM_VALIDATE_DATE_PICKER_V2,
            required: true,
          }
        });
        await renderNavForm({form, onSubmit});

        await apneKalenderOgVelgDato("03.05.2030, fredag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        const errorDiv = await screen.findByText("Datoen kan ikke være senere enn 02.05.2030");
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveClass("error");

        expect(submission).toBeNull();

        await apneKalenderOgVelgDato("02.05.2030, torsdag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        await waitFor(() => expect(submission).not.toBeNull());
        expect(submission.data.oppgiDatoKey).toEqual("2030-05-02");
      }, 10000);

      it("considers both specificEarliestAllowedDate and specificLatestAllowedDate during validation",async () => {
        const form = createForm({
          specificEarliestAllowedDate: "2030-05-02",
          specificLatestAllowedDate: "2030-05-03",
          validate: {
            custom: CUSTOM_VALIDATE_DATE_PICKER_V2,
            required: true,
          }
        });
        await renderNavForm({form, onSubmit});

        await apneKalenderOgVelgDato("04.05.2030, lørdag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        const errorDiv = await screen.findByText("Datoen kan ikke være tidligere enn 02.05.2030 eller senere enn 03.05.2030");
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveClass("error");

        expect(submission).toBeNull();

        await apneKalenderOgVelgDato("01.05.2030, onsdag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        expect(submission).toBeNull();

        await apneKalenderOgVelgDato("02.05.2030, torsdag");
        userEvent.click(await screen.findByRole("button", {name: "Neste"}));

        await waitFor(() => expect(submission).not.toBeNull());
        expect(submission.data.oppgiDatoKey).toEqual("2030-05-02");
      }, 10000);

    });

  });

});
