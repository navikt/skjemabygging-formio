import React from 'react'
import {MemoryRouter} from "react-router-dom";
import {render, waitFor, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AppConfigProvider} from "@navikt/skjemadigitalisering-shared-components";
import NewFormPage from "./NewFormPage";
import {UserAlerterContext} from "../userAlerting";
import featureToggles from "../featureToggles";

describe('NewFormPage', () => {

  it('should create a new form with correct path, title and name', async () => {
    const userAlerter = {flashSuccessMessage: jest.fn(), alertComponent: jest.fn()};
    const onCreate = jest.fn();
    const onLogout = jest.fn();
    render(
      <MemoryRouter>
        <UserAlerterContext.Provider value={userAlerter}>
          <AppConfigProvider featureToggles={featureToggles}>
            <NewFormPage onCreate={onCreate} onLogout={onLogout}/>
          </AppConfigProvider>
        </UserAlerterContext.Provider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Opprett nytt skjema'))

    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 10-20.30');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Et testskjema');
    await userEvent.type(screen.getByLabelText('Temakode'), 'BIL');
    await userEvent.click(screen.getByRole('button', {name: 'Opprett'}));

    expect(onCreate.mock.calls).toHaveLength(1);
    const savedForm = onCreate.mock.calls[0][0];
    expect(savedForm).toMatchObject({
      type: "form",
      path: "nav102030",
      display: "wizard",
      name: "nav102030",
      title: "Et testskjema",
      tags: ["nav-skjema", ""],
    });
    expect(savedForm.properties).toMatchObject({
      skjemanummer: "NAV 10-20.30"
    });
  });

});
