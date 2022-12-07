import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import moment from "moment";
import React from "react";
import FormStatusPanel from "./FormStatusPanel";
import { allLanguagesInNorwegian } from "./PublishedLanguages";

type PartialFormProperties = Pick<
  FormPropertiesType,
  "modified" | "modifiedBy" | "published" | "publishedBy" | "isTestForm" | "unpublished"
>;

describe("FormStatusPanel", () => {
  const now = moment().toISOString();
  const earlier = moment(now).subtract("1", "day").toISOString();

  describe("When form has modified date and no publish date", () => {
    const properties: PartialFormProperties = { modified: now, modifiedBy: "Jenny" };

    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
    });

    it("displays the 'Utkast' status", () => {
      expect(screen.getByText("Utkast")).toBeInTheDocument();
    });

    it("displays 'Lagret dato'", () => {
      expect(screen.getByText("Sist lagret:")).toBeInTheDocument();
    });

    it("displays name of modifier", () => {
      expect(screen.getByText("Jenny")).toBeInTheDocument();
    });

    it("does not display 'Sist publisert'", () => {
      expect(screen.queryByText("Sist publisert:")).toBeNull();
    });
  });

  describe("When form has published date that is the same as modified date", () => {
    const properties: PartialFormProperties = { modified: now, published: now, publishedBy: "Jonny" };

    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
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

    it("displays name of publisher", () => {
      expect(screen.getByText("Jonny")).toBeInTheDocument();
    });
  });

  describe("When form has published date earlier than modified date", () => {
    const properties: PartialFormProperties = { modified: now, published: earlier };

    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
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
      render(<FormStatusPanel publishProperties={{} as FormPropertiesType} />);
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

  describe("When form is unpublished and modified date is same as or before unpublished date", () => {
    const properties: PartialFormProperties = { modified: now, unpublished: now };
    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
    });
    it("modified (date) is before unpublisheddate", () => {
      expect(screen.getByText("Avpublisert")).toBeInTheDocument();
    });
  });

  describe("When form is unpublished and modified date is after unpublished date", () => {
    const properties: PartialFormProperties = { modified: now, unpublished: earlier };
    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
    });
    it("modified (date) is after unpublisheddate", () => {
      expect(screen.getByText("Utkast")).toBeInTheDocument();
    });
  });

  describe("Prop publishedLanguages (array)", () => {
    it("displays nothing if form is not publised", () => {
      render(<FormStatusPanel publishProperties={{} as FormPropertiesType} />);
      expect(screen.queryByText("Publiserte språk:")).not.toBeInTheDocument();
    });

    it("displays nothing if publishedLanguages is undefined", () => {
      const formProps = { published: now, publishedLanguages: undefined } as FormPropertiesType;
      render(<FormStatusPanel publishProperties={formProps} />);
      expect(screen.queryByText("Publiserte språk:")).not.toBeInTheDocument();
    });

    it("displays bokmål if publishedLanguages is empty", () => {
      const formProps = {
        published: now,
        publishedLanguages: [] as string[],
      } as FormPropertiesType;
      render(<FormStatusPanel publishProperties={formProps} />);
      expect(screen.queryByText("Publiserte språk:")).toBeInTheDocument();
      expect(screen.queryByText(allLanguagesInNorwegian["nb-NO"])).toBeInTheDocument();
    });

    it("displays all published languages + bokmål", () => {
      const publishedLanguages = ["en", "nn-NO"];
      const formProps = {
        published: now,
        publishedLanguages,
      } as FormPropertiesType;
      render(<FormStatusPanel publishProperties={formProps} />);
      expect(screen.queryByText("Publiserte språk:")).toBeInTheDocument();
      expect(screen.queryByText(allLanguagesInNorwegian["nb-NO"])).toBeInTheDocument();
      publishedLanguages.forEach((langCode) => {
        expect(screen.queryByText(allLanguagesInNorwegian[langCode])).toBeInTheDocument();
      });
    });
  });

  describe("When form has status test", () => {
    const properties: PartialFormProperties = { modified: now, published: earlier, isTestForm: true };

    beforeEach(() => {
      render(<FormStatusPanel publishProperties={properties as FormPropertiesType} />);
    });

    it("displays the 'Testskjema' status even if published and modified is set", () => {
      expect(screen.getByText("Testskjema")).toBeInTheDocument();
    });
  });
});
