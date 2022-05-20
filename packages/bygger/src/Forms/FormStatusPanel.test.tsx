import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import moment from "moment";
import React from "react";
import FormStatusPanel from "./FormStatusPanel";

type PartialFormProperties = Pick<FormPropertiesType, "modified" | "published">;

describe("FormStatusPanel", () => {
  const now = moment().toISOString();
  const earlier = moment(now).subtract("1", "day").toISOString();

  describe("When form has modified date and no publish date", () => {
    const properties: PartialFormProperties = { modified: now };

    beforeEach(() => {
      render(<FormStatusPanel formProperties={properties as FormPropertiesType} />);
    });

    it("displays the 'Utkast' status", () => {
      expect(screen.getByText("Utkast")).toBeInTheDocument();
    });

    it("displays 'Lagret dato'", () => {
      expect(screen.getByText("Sist lagret:")).toBeInTheDocument();
    });

    it("does not display 'Sist publisert'", () => {
      expect(screen.queryByText("Sist publisert:")).toBeNull();
    });
  });

  describe("When form has published date that is the same as modified date", () => {
    const properties: PartialFormProperties = { modified: now, published: now };

    beforeEach(() => {
      render(<FormStatusPanel formProperties={properties as FormPropertiesType} />);
    });

    it("displays the 'Publisert' status", () => {
      expect(screen.getByText("Publisert")).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.getByText("Sist lagret:")).toBeInTheDocument();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.getByText("Sist publisert:")).toBeInTheDocument();
    });
  });

  describe("When form has published date earlier than modified date", () => {
    const properties: PartialFormProperties = { modified: now, published: earlier };

    beforeEach(() => {
      render(<FormStatusPanel formProperties={properties as FormPropertiesType} />);
    });

    it("displays the 'Upubliserte endringer' status", () => {
      expect(screen.getByText("Upubliserte endringer")).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.getByText("Sist lagret:")).toBeInTheDocument();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.getByText("Sist publisert:")).toBeInTheDocument();
    });
  });

  describe("When form has no modified date and no published date", () => {
    beforeEach(() => {
      render(<FormStatusPanel formProperties={{} as FormPropertiesType} />);
    });

    it("displays the 'Ukjent status' status", () => {
      expect(screen.getByText("Ukjent status")).toBeInTheDocument();
    });

    it("displays 'Sist lagret'", () => {
      expect(screen.queryByText("Sist lagret:")).toBeNull();
    });

    it("displays 'Sist publisert'", () => {
      expect(screen.queryByText("Sist publisert:")).toBeNull();
    });
  });
});
