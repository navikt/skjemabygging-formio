import { fireEvent, render, screen } from '@testing-library/react';
import SearchFilterInput from './SearchFilterInput';

const dispatchMock = vi.fn();

describe('SearchFilterInput', () => {
  beforeEach(() => {
    render(<SearchFilterInput id={'id'} searchFilter={{ key: 'Feltnavn', value: 'value' }} dispatch={dispatchMock} />);
  });

  afterEach(() => {
    dispatchMock.mockReset();
  });

  describe('Feltnavn input field', () => {
    it('is rendered', () => {
      expect(screen.getByLabelText('Feltnavn')).toBeDefined();
    });

    it('dispatches an edit action with key in the payload on change', () => {
      fireEvent.change(screen.getByLabelText('Feltnavn'), { target: { value: 'feltnavn-key' } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'edit', payload: { id: 'id', key: 'feltnavn-key' } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Operator input field', () => {
    it('is rendered', () => {
      expect(screen.getByLabelText('Operator')).toBeDefined();
      expect(screen.getByLabelText('Operator')).toHaveDisplayValue('Er lik');
    });

    it('dispatches an edit action on change', () => {
      fireEvent.change(screen.getByLabelText('Operator'), { target: { value: 'n_eq' } });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'edit',
        payload: { id: 'id', operator: 'n_eq', value: 'value' },
      });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it('dispatches an edit action where value is empty when a unary operator is selected', () => {
      fireEvent.change(screen.getByLabelText('Operator'), { target: { value: 'exists' } });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'edit',
        payload: { id: 'id', operator: 'exists', value: '' },
      });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Verdi input field', () => {
    it('is rendered', () => {
      expect(screen.getByLabelText('Verdi')).toBeDefined();
    });

    it('dispatches an edit action with value on change', () => {
      fireEvent.change(screen.getByLabelText('Verdi'), { target: { value: 'new value' } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'edit', payload: { id: 'id', value: 'new value' } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });
});
