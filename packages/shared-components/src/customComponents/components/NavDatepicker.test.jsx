import moment from "moment";
import NavDatePicker, { validateEarliestAndLatestDate, validateToAndFromDate } from "./NavDatepicker";

describe("NavDatePicker", () => {
  Date.now = jest.fn(() => new Date("2030-05-15T12:00:00.000Z").getTime());
  describe("validation", () => {
    let datePicker;

    beforeEach(() => {
      datePicker = new NavDatePicker();
    });

    it("returns true when input is undefined", () => {
      expect(datePicker.validateDatePicker(undefined)).toBe(true);
    });

    it("returns error message for to and from date, when both validations fail", () => {
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-21" }, "fromDate", false, "10")).toBe(
        "Datoen må være senere enn fra-dato (21.05.2030)"
      );
    });

    it("returns error message for earliest/latest date when only earliest/latest validation fails", () => {
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-19" }, "fromDate", false, "10")).toBe(
        "Datoen kan ikke være tidligere enn 25.05.2030"
      );
    });

    it("returns error message when both earliest/latest is set to number 0", () => {
      expect(datePicker.validateDatePicker("2030-05-20", { fromDate: "2030-05-19" }, "fromDate", false, 0, 0)).toBe(
        "Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030"
      );
    });

    describe("Validation inside data grid", () => {

      it("fails validation for date inside data grid", () => {
        expect(datePicker.validateDatePicker(
          "2021-10-01",
          {"datagrid":[{"fraDato":"2021-10-02","tilDato":"2021-10-01"}]},
          "datagrid.fraDato",
          true,
          undefined,
          undefined,
          {"fraDato":"2021-10-02","tilDato":"2021-10-01"}
        )).toBe(
          "Datoen kan ikke være tidligere enn fra-dato (02.10.2021)"
        );
      });

      it("validation ok when date is later than fromDate inside data grid", () => {
        expect(datePicker.validateDatePicker(
          "2021-10-03",
          {"datagrid":[{"fraDato":"2021-10-02","tilDato":"2021-10-03"}]},
          "datagrid.fraDato",
          true,
          undefined,
          undefined,
          {"fraDato":"2021-10-02","tilDato":"2021-10-03"}
        )).toBe(true);
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
          expect(validateToAndFromDate(fromDate, earlierThanFromDate, true)).toBe(
            "Datoen kan ikke være tidligere enn fra-dato (31.12.2030)"
          );
        });

        it("Returns true when inputDate is same as from-date", () => {
          expect(validateToAndFromDate(fromDate, sameAsFromDate, true)).toBe(true);
        });

        it("Returns true when inputDate is later than from-date", () => {
          expect(validateToAndFromDate(fromDate, laterThanFromDate, true)).toBe(true);
        });
      });

      describe("When mayBeEqual is false", () => {
        it("fails with appropriate message when input is earlier than from-date", () => {
          expect(validateToAndFromDate(fromDate, earlierThanFromDate, false)).toBe(
            "Datoen må være senere enn fra-dato (31.12.2030)"
          );
        });

        it("fails with appropriate message when input is same as from-date", () => {
          expect(validateToAndFromDate(fromDate, earlierThanFromDate, false)).toBe(
            "Datoen må være senere enn fra-dato (31.12.2030)"
          );
        });

        it("Returns true when inputDate is later than from-date", () => {
          expect(validateToAndFromDate(fromDate, laterThanFromDate, false)).toBe(true);
        });
      });
    });

    describe("validateEarliestAndLatestDate", () => {
      describe("When earliestFromToday and latestFromToday are set", () => {
        it("doesn't fail if latest is before earliest", () => {
          expect(validateEarliestAndLatestDate("2", "1", moment())).toBe(true);
        });

        it("fails with appropriate message if input is before earliest date", () => {
          expect(validateEarliestAndLatestDate("1", "2", moment())).toBe(
            "Datoen kan ikke være tidligere enn 16.05.2030 eller senere enn 17.05.2030"
          );
        });

        it("fails with appropriate message if input is after latest date", () => {
          expect(validateEarliestAndLatestDate("-2", "-1", moment())).toBe(
            "Datoen kan ikke være tidligere enn 13.05.2030 eller senere enn 14.05.2030"
          );
        });

        it("returns true if input is same as earliest date", () => {
          expect(validateEarliestAndLatestDate("0", "1", moment())).toBe(true);
        });

        it("returns true if input is between earliest and latest date", () => {
          expect(validateEarliestAndLatestDate("-1", "1", moment())).toBe(true);
        });

        it("returns true if input is same as latest date", () => {
          expect(validateEarliestAndLatestDate("-1", "0", moment())).toBe(true);
        });
      });

      describe("When earliestFromToday is set", () => {
        it("fails with appropriate message if input is before earliest date", () => {
          expect(validateEarliestAndLatestDate("1", "", moment())).toBe(
            "Datoen kan ikke være tidligere enn 16.05.2030"
          );
        });

        it("returns true if input is same as earliest date", () => {
          expect(validateEarliestAndLatestDate("0", "", moment())).toBe(true);
        });

        it("returns true if input is after earliest", () => {
          expect(validateEarliestAndLatestDate("-1", "", moment())).toBe(true);
        });
      });

      describe("When latestFromToday is set", () => {
        it("fails with appropriate message if input is after latest date", () => {
          expect(validateEarliestAndLatestDate("", "-1", moment())).toBe("Datoen kan ikke være senere enn 14.05.2030");
        });

        it("returns true if input is same as latest date", () => {
          expect(validateEarliestAndLatestDate("", "0", moment())).toBe(true);
        });

        it("returns true if input is before latest", () => {
          expect(validateEarliestAndLatestDate("", "1", moment())).toBe(true);
        });
      });

      describe("both earliestFromToday and latestFromToday is set to number 0", () => {

        it("fails if selected date is tomorrow", () => {
          expect(validateEarliestAndLatestDate(0, 0, moment().add(1, "d"))).toBe("Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030");
        });

        it("validates ok if selected date is today", () => {
          expect(validateEarliestAndLatestDate(0, 0, moment())).toBe(true);
        });

        it("validates ok if selected date is yesterday", () => {
          expect(validateEarliestAndLatestDate(0, 0, moment().subtract(1, "d"))).toBe("Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030");
        });

      });

      describe("latestFromToday is set to number 0", () => {

        it("fails if selected date is tomorrow", () => {
          expect(validateEarliestAndLatestDate(undefined, 0, moment().add(1, "d"))).toBe("Datoen kan ikke være senere enn 15.05.2030");
        });

        it("validates ok if selected date is today", () => {
          expect(validateEarliestAndLatestDate(undefined, 0, moment())).toBe(true);
        });

        it("validates ok if selected date is yesterday", () => {
          expect(validateEarliestAndLatestDate(undefined, 0, moment().subtract(1, "d"))).toBe(true);
        });

      });

      describe("earliestFromToday is set to number 0", () => {

        it("fails if selected date is yesterday", () => {
          expect(validateEarliestAndLatestDate(0, undefined, moment().subtract(1, "d"))).toBe("Datoen kan ikke være tidligere enn 15.05.2030");
        });

        it("validates ok if selected date is today", () => {
          expect(validateEarliestAndLatestDate(0, undefined, moment())).toBe(true);
        });

        it("validates ok if selected date is tomorrow", () => {
          expect(validateEarliestAndLatestDate(0, undefined, moment().add(1, "d"))).toBe(true);
        });

      });

      it("returns true if neither earliestFromToday or latestFromToday are set", () => {
        expect(validateEarliestAndLatestDate("", "", moment())).toBe(true);
      });

      it("returns true if both earliestFromToday or latestFromToday are undefined", () => {
        expect(validateEarliestAndLatestDate(undefined, undefined, moment())).toBe(true);
      });

    });
  });
});
