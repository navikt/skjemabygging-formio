import React from "react";
import {render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {InprocessQuipApp} from "../fakeBackend/InprocessQuipApp";
import {dispatcherWithBackend} from "../fakeBackend/fakeWebApp";
import {FakeBackend} from "../fakeBackend/FakeBackend";
import NavFormBuilder from "./NavFormBuilder";
import testform from "./testdata/conditional-multiple-dependencies";
import Components from "formiojs/components/Components";
import { Formio } from "formiojs";
import { Template as navdesign } from "@navikt/skjemadigitalisering-shared-components";
import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import fetchMock from "jest-fetch-mock";

const findClosestWithAttribute = (element, {name, value}) => {
  if (element.getAttribute(name) === value) {
    return element;
  }
  if (!element.parentElement) {
    return null;
  }
  return findClosestWithAttribute(element.parentElement, {name, value});
}

describe("NavFormBuilder", () => {

  beforeAll(() => {
    Formio.use(navdesign);
    Components.setComponents(CustomComponents);
    new Formio("http://unittest.nav-formio-api.no");
  });

  beforeEach(() => {
    const mockBackend = new InprocessQuipApp(dispatcherWithBackend(new FakeBackend()));
    fetchMock.mockImplementation(mockBackend.fetchImpl);
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  describe('A form with conditional dependencies', () => {

    let onChangeMock;
    let onReadyMock;

    beforeEach(async () => {
      onChangeMock = jest.fn();
      onReadyMock = jest.fn();
      render(<NavFormBuilder form={testform} onChange={onChangeMock} onReady={onReadyMock} />);
      await waitFor(() => expect(onReadyMock.mock.calls).toHaveLength(1));
      onChangeMock.mockReset();
    });

    it("renders link for the first page in form definition",  async () => {
      expect(await screen.findByRole("link",{name: "Dine opplysninger"})).toBeInTheDocument();
    });

    it("adds another page",  async () => {
      const leggTilNyttStegKnapp = await screen.findByRole("button", {name: "Legg til nytt steg"});
      userEvent.click(leggTilNyttStegKnapp);
      expect(await screen.findByRole("link",{name: "Page 2"})).toBeTruthy();
      await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));
    });

    it("removes a component",  async () => {
      const checkbox = screen.queryByLabelText("Jeg har en yndlingsfarge");
      expect(checkbox).toBeInTheDocument();

      const builderComponent = findClosestWithAttribute(checkbox, {name: "data-testid", value: "builder-component"});

      const removeComponentButton = await within(builderComponent).findByTitle("Slett");
      userEvent.click(removeComponentButton);

      expect(screen.queryByLabelText("Jeg har en yndlingsfarge")).not.toBeInTheDocument();
      await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));
    });

  });

});
