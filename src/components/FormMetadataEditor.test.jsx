import { FormMetadataEditor } from "./FormMetadataEditor";
import React from "react";
import {render, screen} from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import waitForExpect from "wait-for-expect";
import {FakeBackend} from "../fakeBackend/FakeBackend";

describe('FormMetadataEditor', () => {

  let mockOnChange;
  let fakeBackend;

  beforeEach(() => {
    mockOnChange = jest.fn();
    fakeBackend = new FakeBackend()
  });

  it('should update form when title is changed', async () => {
    const {rerender} = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange}/>);
    await userEvent.type(screen.getByRole('textbox', {name: /Title/i}), 'Søknad om førerhund');

    const updatedForm = {...fakeBackend.form(), title: 'Søknad om førerhund'};
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByRole('textbox', {name: /Title/i})).toHaveAttribute('value', 'Søknad om førerhund');
  });
});