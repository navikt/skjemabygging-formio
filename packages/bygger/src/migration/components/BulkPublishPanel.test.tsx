import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import * as api from "../api";
import BulkPublishPanel from "./BulkPublishPanel";

const properties: FormPropertiesType = {
  skjemanummer: "skjemanummer",
  tema: "tema",
  innsending: "PAPIR_OG_DIGITAL",
  signatures: {
    signature1: "",
    signature2: "",
    signature3: "",
    signature4: "",
    signature5: "",
  },
};
const form: NavFormType = {
  title: "Form title",
  name: "formName",
  path: "formPath",
  type: "form",
  display: "wizard",
  tags: ["nav-skjema", ""],
  components: [],
  properties,
};

const testForm1 = { ...form, path: "form1", name: "Form 1", properties: { ...properties, skjemanummer: "001" } };
const testForm2 = { ...form, path: "form2", name: "Form 2", properties: { ...properties, skjemanummer: "002" } };
const testForm3 = { ...form, path: "form3", name: "Form 3", properties: { ...properties, skjemanummer: "003" } };

describe("BulkPublishPanel", () => {
  const bulkPublish = jest.fn();

  beforeEach(() => {
    jest.spyOn(api, "bulkPublish").mockImplementation(bulkPublish);
    render(<BulkPublishPanel forms={[testForm1, testForm2, testForm3]} appElement={document.createElement("div")} />);
  });

  afterEach(() => {
    bulkPublish.mockClear();
  });

  it("checks all three checkboxes initially", () => {
    const checkBoxes = screen.getAllByRole("checkbox", { checked: true });
    expect(checkBoxes).toHaveLength(3);
  });

  describe("When a form is unchecked", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByRole("checkbox", { name: "002 - Form 2 (form2)" }));
    });

    it("unselects one form", () => {
      const unCheckedCheckBoxes = screen.getAllByRole("checkbox", { checked: false });
      expect(unCheckedCheckBoxes).toHaveLength(1);
    });

    describe("When modal button is clicked", () => {
      beforeEach(() => {
        const button = screen.getByRole("button");
        fireEvent.click(button);
      });

      it("opens modal with a summary of which forms will be published", () => {
        const lists = screen.getAllByRole("list");

        expect(screen.getByRole("heading", { name: "Skjemaer som vil bli publisert" })).toBeTruthy();
        const willBePublished = within(lists[1]).getAllByRole("listitem");
        expect(willBePublished).toHaveLength(2);
        expect(willBePublished[0].textContent).toBe("Form 1");
        expect(willBePublished[1].textContent).toBe("Form 3");

        expect(screen.getByRole("heading", { name: "Skjemaer som ikke vil bli publisert" })).toBeTruthy();
        const willNotBePublished = within(lists[2]).getAllByRole("listitem");
        expect(willNotBePublished).toHaveLength(1);
        expect(willNotBePublished[0].textContent).toBe("Form 2");
      });

      it("bulk publishes selected forms when bulk publish is confirmed", async () => {
        fireEvent.click(screen.getByRole("button", { name: "Bekreft publisering" }));
        await waitFor(() => expect(bulkPublish).toHaveBeenCalledTimes(1));
        expect(bulkPublish).toHaveBeenCalledWith("", { formPaths: ["form1", "form3"] });
      });
    });
  });
});
