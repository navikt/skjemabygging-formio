import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import * as api from "../api";
import BulkPublishPanel from "./BulkPublishPanel";

Modal.setAppElement(document.createElement("div"));

const published = {
  modified: "2022-11-17T13:12:38.825Z",
  modifiedBy: "user@company.com",
  published: "2022-11-17T13:12:38.825Z",
};
const pending = {
  modified: "2022-12-08T15:05:28.353Z",
  modifiedBy: "user@company.com",
  published: "2022-03-17T13:12:38.825Z",
};
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

const testForm1 = {
  ...form,
  path: "form1",
  name: "Form 1",
  properties: { ...properties, ...published, skjemanummer: "001" },
};
const testForm2 = {
  ...form,
  path: "form2",
  name: "Form 2",
  properties: { ...properties, ...pending, skjemanummer: "002" },
};
const testForm3 = { ...form, path: "form3", name: "Form 3", properties: { ...properties, skjemanummer: "003" } };

describe("BulkPublishPanel", () => {
  const bulkPublish = jest.fn();

  beforeEach(() => {
    jest.spyOn(api, "bulkPublish").mockImplementation(bulkPublish);
    render(<BulkPublishPanel forms={[testForm1, testForm2, testForm3]} />);
  });

  afterEach(() => {
    bulkPublish.mockClear();
  });

  it("checkboxes for pending and published forms are initially checked", () => {
    expect(screen.getByRole("checkbox", { name: "Form 1", checked: true })).toBeDefined();
    expect(screen.getByRole("checkbox", { name: "Form 2", checked: true })).toBeDefined();
    expect(screen.getByRole("checkbox", { name: "Form 3", checked: false })).toBeDefined();
  });

  describe("When a form is unchecked", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByRole("checkbox", { name: "Form 2" }));
    });

    it("unselects one form", () => {
      expect(screen.getByRole("checkbox", { name: "Form 2" })).not.toBeChecked();
    });

    describe("When modal button is clicked", () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole("checkbox", { name: "Form 3" }));
        const button = screen.getByRole("button");
        fireEvent.click(button);
      });

      it("opens modal with a summary of which forms will be published", () => {
        const table = screen.getAllByRole("table");

        expect(screen.getByRole("heading", { name: "Skjemaer som vil bli publisert" })).toBeTruthy();
        const willBePublished = within(table[1]).getAllByRole("row");
        expect(willBePublished).toHaveLength(3);
        expect(willBePublished[1]).toHaveTextContent("Form 1");
        expect(willBePublished[2]).toHaveTextContent("Form 3");

        expect(screen.getByRole("heading", { name: "Skjemaer som ikke vil bli publisert" })).toBeTruthy();
        const willNotBePublished = within(table[2]).getAllByRole("row");
        expect(willNotBePublished).toHaveLength(2);
        expect(willNotBePublished[1]).toHaveTextContent("Form 2");
      });

      it("bulk publishes selected forms when bulk publish is confirmed", async () => {
        fireEvent.click(screen.getByRole("button", { name: "Bekreft publisering" }));
        await waitFor(() => expect(bulkPublish).toHaveBeenCalledTimes(1));
        expect(bulkPublish).toHaveBeenCalledWith("", { formPaths: ["form1", "form3"] });
      });
    });
  });
});
